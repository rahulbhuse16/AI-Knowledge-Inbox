import asyncio
import ipaddress
import socket
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup
from fastapi import HTTPException
from playwright.sync_api import sync_playwright

from app.core.logging import get_logger

logger = get_logger(__name__)

MAX_RESPONSE_SIZE = 5 * 1024 * 1024
MAX_REDIRECTS = 5
PLAYWRIGHT_TIMEOUT = 30_000

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/140.0.0.0 Safari/537.36"
)
class URLFetchError(Exception):
    """Raised when a URL cannot be fetched or rendered.""" 

class URLService:

    async def fetch(
        self,
        url: str,
    ) -> tuple[str, str | None]:

        self._validate_url(url)

        logger.info("Fetching URL | url=%s", url)

        # ---------------------------------------------------------
        # 1. Try normal HTTP first
        # ---------------------------------------------------------
        try:
            content, title, final_url = await self._fetch_with_http(url)

            if self._has_meaningful_content(content):
                logger.info(
                    "HTTP extraction successful | url=%s title=%s",
                    final_url,
                    title,
                )

                return content, title

            logger.info(
                "HTTP returned insufficient content, "
                "falling back to Playwright | url=%s",
                final_url,
            )

        except Exception as exc:
            logger.warning(
                "HTTP fetch failed, falling back to Playwright | "
                "url=%s error=%s",
                url,
                exc,
            )

        # ---------------------------------------------------------
        # 2. JavaScript-rendered page
        # ---------------------------------------------------------
        try:
            content, title, final_url = await self._fetch_with_browser(url)

            if not self._has_meaningful_content(content):
                raise HTTPException(
                    status_code=422,
                    detail="The webpage does not contain enough readable content.",
                )

            logger.info(
                "Browser extraction successful | url=%s title=%s",
                final_url,
                title,
            )

            return content, title

        except HTTPException:
            raise

        except Exception as exc:
            logger.exception(
                "Browser rendering failed | url=%s",
                url,
            )

            raise HTTPException(
                status_code=422,
                detail="Failed to render the webpage.",
            ) from exc

    # =============================================================
    # HTTP FETCH
    # =============================================================

    async def _fetch_with_http(
        self,
        url: str,
    ) -> tuple[str, str | None, str]:

        current_url = url

        async with httpx.AsyncClient(
            follow_redirects=False,
            timeout=20.0,
            headers={"User-Agent": USER_AGENT},
        ) as client:

            for redirect_count in range(MAX_REDIRECTS + 1):

                self._validate_url(current_url)

                response = await client.get(current_url)

                # -------------------------------------------------
                # Redirect
                # -------------------------------------------------
                if response.is_redirect:

                    if redirect_count >= MAX_REDIRECTS:
                        raise HTTPException(
                            status_code=422,
                            detail="Too many redirects.",
                        )

                    location = response.headers.get("location")

                    if not location:
                        raise HTTPException(
                            status_code=422,
                            detail="Redirect response missing Location header.",
                        )

                    current_url = urljoin(
                        current_url,
                        location,
                    )

                    continue

                # -------------------------------------------------
                # HTTP error
                # -------------------------------------------------
                response.raise_for_status()

                self._validate_response(response)

                html = response.text

                content, title = self._extract_content(html)

                return content, title, current_url

        raise HTTPException(
            status_code=422,
            detail="Unable to fetch webpage.",
        )

    # =============================================================
    # PLAYWRIGHT
    # =============================================================

    async def _fetch_with_browser(
        self,
        url: str,
    ) -> tuple[str, str | None, str]:

        # IMPORTANT:
        #
        # Playwright Sync API runs inside a worker thread.
        #
        # This prevents Playwright's Chromium subprocess from
        # conflicting with psycopg's Windows event loop.
        #
        return await asyncio.to_thread(
            self._render_with_playwright,
            url,
        )

    def _render_with_playwright(
        self,
        url: str,
    ) -> tuple[str, str | None, str]:

        logger.info(
            "Starting Playwright rendering | url=%s",
            url,
        )

        with sync_playwright() as playwright:

            browser = playwright.chromium.launch(
                headless=True,
            )

            try:
                page = browser.new_page(
                    user_agent=USER_AGENT,
                )

                page.goto(
                    url,
                    wait_until="domcontentloaded",
                    timeout=PLAYWRIGHT_TIMEOUT,
                )

                final_url = page.url

                # -------------------------------------------------
                # Validate final redirect destination
                # -------------------------------------------------
                self._validate_url(final_url)

                # -------------------------------------------------
                # Give React/Vue/etc. some time to render
                # -------------------------------------------------
                try:
                    page.wait_for_load_state(
                        "networkidle",
                        timeout=5_000,
                    )
                except Exception:
                    # Some pages keep network connections open.
                    # DOMContentLoaded is already sufficient.
                    pass

                html = page.content()

                content, title = self._extract_content(html)

                return content, title, final_url

            finally:
                browser.close()

    # =============================================================
    # URL SECURITY
    # =============================================================

    def _validate_url(
        self,
        url: str,
    ) -> None:

        parsed = urlparse(url)

        if parsed.scheme not in {"http", "https"}:
            raise HTTPException(
                status_code=422,
                detail="Only HTTP and HTTPS URLs are supported.",
            )

        hostname = parsed.hostname

        if not hostname:
            raise HTTPException(
                status_code=422,
                detail="Invalid URL.",
            )

        hostname = hostname.lower()

        blocked_hostnames = {
            "localhost",
            "localhost.localdomain",
        }

        if hostname in blocked_hostnames:
            raise HTTPException(
                status_code=422,
                detail="URLs pointing to internal or private network addresses are not allowed.",
            )

        # ---------------------------------------------------------
        # Direct IP address
        # ---------------------------------------------------------
        try:
            ip = ipaddress.ip_address(hostname)

            if self._is_blocked_ip(ip):
                raise HTTPException(
                    status_code=422,
                    detail="URLs pointing to internal or private network addresses are not allowed.",
                )

            return

        except ValueError:
            # Hostname, not an IP address.
            pass

        # ---------------------------------------------------------
        # DNS validation
        # ---------------------------------------------------------
        try:
            addresses = socket.getaddrinfo(
                hostname,
                parsed.port or (443 if parsed.scheme == "https" else 80),
                type=socket.SOCK_STREAM,
            )
        except socket.gaierror as exc:
            raise HTTPException(
                status_code=422,
                detail="Unable to resolve the hostname.",
            ) from exc

        for address in addresses:

            resolved_ip = address[4][0]

            try:
                ip = ipaddress.ip_address(resolved_ip)
            except ValueError:
                continue

            if self._is_blocked_ip(ip):
                raise HTTPException(
                    status_code=422,
                    detail="URLs pointing to internal or private network addresses are not allowed.",
                )

    @staticmethod
    def _is_blocked_ip(
        ip: ipaddress.IPv4Address | ipaddress.IPv6Address,
    ) -> bool:

        # ---------------------------------------------------------
        # NAT64
        #
        # 64:ff9b::/96 embeds IPv4 addresses.
        # Example:
        #
        # 64:ff9b::d818:3912
        #
        # becomes:
        #
        # 216.24.57.18
        # ---------------------------------------------------------

        if isinstance(ip, ipaddress.IPv6Address):

            nat64_prefix = ipaddress.IPv6Network(
                "64:ff9b::/96"
            )

            if ip in nat64_prefix:

                ipv4_int = int(ip) & 0xFFFFFFFF

                embedded_ipv4 = ipaddress.IPv4Address(
                    ipv4_int
                )

                return URLService._is_blocked_ip(
                    embedded_ipv4
                )

            blocked_ipv6_networks = [
                ipaddress.IPv6Network("::1/128"),
                ipaddress.IPv6Network("::/128"),
                ipaddress.IPv6Network("fc00::/7"),
                ipaddress.IPv6Network("fe80::/10"),
                ipaddress.IPv6Network("ff00::/8"),
            ]

            return any(
                ip in network
                for network in blocked_ipv6_networks
            )

        # ---------------------------------------------------------
        # IPv4
        # ---------------------------------------------------------

        blocked_ipv4_networks = [
            ipaddress.IPv4Network("10.0.0.0/8"),
            ipaddress.IPv4Network("172.16.0.0/12"),
            ipaddress.IPv4Network("192.168.0.0/16"),
            ipaddress.IPv4Network("127.0.0.0/8"),
            ipaddress.IPv4Network("169.254.0.0/16"),
            ipaddress.IPv4Network("100.64.0.0/10"),
            ipaddress.IPv4Network("0.0.0.0/8"),
            ipaddress.IPv4Network("224.0.0.0/4"),
        ]

        return any(
            ip in network
            for network in blocked_ipv4_networks
        )

    # =============================================================
    # RESPONSE VALIDATION
    # =============================================================

    @staticmethod
    def _validate_response(
        response: httpx.Response,
    ) -> None:

        content_type = response.headers.get(
            "content-type",
            "",
        ).lower()

        allowed_content_types = (
            "text/html",
            "text/plain",
            "application/xhtml+xml",
        )

        if not content_type.startswith(
            allowed_content_types
        ):
            raise HTTPException(
                status_code=422,
                detail="The URL does not point to a supported webpage.",
            )

        content_length = response.headers.get(
            "content-length"
        )

        if content_length:

            try:
                if int(content_length) > MAX_RESPONSE_SIZE:
                    raise HTTPException(
                        status_code=422,
                        detail="The webpage is too large.",
                    )
            except ValueError:
                pass

    # =============================================================
    # HTML EXTRACTION
    # =============================================================

    @staticmethod
    def _extract_content(
        html: str,
    ) -> tuple[str, str | None]:

        soup = BeautifulSoup(
            html,
            "html.parser",
        )

        title = None

        if soup.title:
            title = soup.title.get_text(
                " ",
                strip=True,
            )

        # ---------------------------------------------------------
        # Remove non-content elements
        # ---------------------------------------------------------

        for tag in soup(
            [
                "script",
                "style",
                "noscript",
                "nav",
                "footer",
                "header",
                "aside",
                "form",
                "svg",
            ]
        ):
            tag.decompose()

        # ---------------------------------------------------------
        # Prefer <main>
        # ---------------------------------------------------------

        main = soup.find("main")

        if main:
            text = main.get_text(
                "\n",
                strip=True,
            )
        else:

            body = soup.body

            if body:
                text = body.get_text(
                    "\n",
                    strip=True,
                )
            else:
                text = soup.get_text(
                    "\n",
                    strip=True,
                )

        # Normalize whitespace
        lines = [
            line.strip()
            for line in text.splitlines()
            if line.strip()
        ]

        content = "\n".join(lines)

        return content, title

    # =============================================================
    # CONTENT QUALITY
    # =============================================================

    @staticmethod
    def _has_meaningful_content(
        content: str,
    ) -> bool:

        normalized = " ".join(
            content.split()
        )

        return len(normalized) >= 200