"""Nome do usuário.

Revision ID: 0002
Revises: 0001
Create Date: 2026-09-22
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Opcional: usuários criados antes desta versão não têm nome.
    op.add_column("usuarios", sa.Column("nome", sa.String(100), nullable=True))


def downgrade() -> None:
    op.drop_column("usuarios", "nome")
