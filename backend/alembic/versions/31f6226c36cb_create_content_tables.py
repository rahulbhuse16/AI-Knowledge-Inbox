"""create content tables

Revision ID: 31f6226c36cb
Revises:
Create Date: 2026-09-28 12:44:56.139626

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import pgvector


# revision identifiers, used by Alembic.
revision: str = "31f6226c36cb"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create AI Knowledge Inbox tables."""

    # Enable PostgreSQL vector extension.
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.create_table(
        "content_items",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column(
            "source_type",
            sa.String(length=20),
            nullable=False,
        ),
        sa.Column(
            "source_url",
            sa.String(length=2048),
            nullable=True,
        ),
        sa.Column(
            "title",
            sa.String(length=500),
            nullable=True,
        ),
        sa.Column(
            "raw_content",
            sa.Text(),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "content_chunks",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column(
            "content_item_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "chunk_index",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "content",
            sa.Text(),
            nullable=False,
        ),
        sa.Column(
            "embedding",
            pgvector.sqlalchemy.vector.VECTOR(dim=384),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["content_item_id"],
            ["content_items.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_content_chunks_content_item_id",
        "content_chunks",
        ["content_item_id"],
        unique=False,
    )


def downgrade() -> None:
    """Drop AI Knowledge Inbox tables."""

    op.drop_index(
        "ix_content_chunks_content_item_id",
        table_name="content_chunks",
    )

    op.drop_table("content_chunks")
    op.drop_table("content_items")