from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.classificacao import VALOR_MAX, VALOR_MIN
from app.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    nome: Mapped[str | None] = mapped_column(String(100))
    senha_hash: Mapped[str] = mapped_column(String(255))
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    medicoes: Mapped[list["Medicao"]] = relationship(
        back_populates="usuario", cascade="all, delete-orphan"
    )


class Medicao(Base):
    __tablename__ = "medicoes"
    __table_args__ = (
        CheckConstraint(
            f"valor BETWEEN {VALOR_MIN} AND {VALOR_MAX}", name="ck_medicoes_valor_faixa"
        ),
        Index("ix_medicoes_usuario_data", "usuario_id", "data_hora"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"))
    valor: Mapped[int]
    # Sempre gravado em UTC; a conversão para o fuso local é feita na exibição.
    data_hora: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    usuario: Mapped[Usuario] = relationship(back_populates="medicoes")
