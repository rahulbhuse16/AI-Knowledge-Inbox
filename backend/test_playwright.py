import asyncio

from playwright.async_api import async_playwright


async def main():
    async with async_playwright() as p:
        print("Launching Chromium...")

        browser = await p.chromium.launch(headless=True)

        page = await browser.new_page()

        print("Opening Aether...")

        await page.goto(
            "https://aether-y4e6.onrender.com/",
            wait_until="domcontentloaded",
            timeout=30_000,
        )

        print("TITLE:", await page.title())

        content = await page.locator("body").inner_text()

        print("\nCONTENT:")
        print(content[:3000])

        await browser.close()

        print("\nPlaywright test completed successfully.")


if __name__ == "__main__":
    asyncio.run(main())