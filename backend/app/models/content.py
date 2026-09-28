from datetime import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ContentItem(Base):
    __tablename__ = "content_items"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    source_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    source_url: Mapped[str | None] = mapped_column(
        String(2048),
        nullable=True,
    )

    title: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    raw_content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    chunks: Mapped[list["ContentChunk"]] = relationship(
        back_populates="content_item",
        cascade="all, delete-orphan",
    )


class ContentChunk(Base):
    __tablename__ = "content_chunks"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    content_item_id: Mapped[int] = mapped_column(
        ForeignKey("content_items.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    chunk_index: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    embedding: Mapped[list[float]] = mapped_column(
        Vector(384),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    content_item: Mapped["ContentItem"] = relationship(
        back_populates="chunks",
    )