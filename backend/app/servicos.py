from collections.abc import Sequence
from datetime import UTC, datetime, timedelta

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.classificacao import ALVO_MAX, ALVO_MIN
from app.models import Medicao
from app.schemas import Estatisticas


def inicio_do_periodo(dias: int) -> datetime:
    return datetime.now(UTC) - timedelta(days=dias)


def calcular_estatisticas(db: Session, usuario_id: int, dias: int) -> Estatisticas:
    no_alvo = case((Medicao.valor.between(ALVO_MIN, ALVO_MAX), 1), else_=0)
    hipo = case((Medicao.valor < ALVO_MIN, 1), else_=0)
    consulta = select(
        func.count(Medicao.id),
        func.avg(Medicao.valor),
        func.min(Medicao.valor),
        func.max(Medicao.valor),
        func.sum(no_alvo),
        func.sum(hipo),
    ).where(Medicao.usuario_id == usuario_id, Medicao.data_hora >= inicio_do_periodo(dias))
    quantidade, media, minimo, maximo, qtd_alvo, qtd_hipo = db.execute(consulta).one()

    return Estatisticas(
        dias=dias,
        quantidade=quantidade,
        media=round(float(media), 1) if media is not None else None,
        minimo=minimo,
        maximo=maximo,
        percentual_alvo=round(100 * qtd_alvo / quantidade, 1) if quantidade else None,
        hipoglicemias=qtd_hipo or 0,
    )


def medicoes_do_periodo(db: Session, usuario_id: int, dias: int | None) -> Sequence[Medicao]:
    consulta = select(Medicao).where(Medicao.usuario_id == usuario_id)
    if dias is not None:
        consulta = consulta.where(Medicao.data_hora >= inicio_do_periodo(dias))
    return db.scalars(consulta.order_by(Medicao.data_hora)).all()
