from collections.abc import Sequence

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import AwareDatetime
from sqlalchemy import select

from app.datas import para_utc
from app.deps import DbSessao, UsuarioAtual
from app.models import Medicao, Usuario
from app.schemas import MedicaoEntrada, MedicaoSaida

router = APIRouter(prefix="/api/medicoes", tags=["medições"])


def _buscar(db: DbSessao, usuario: Usuario, medicao_id: int) -> Medicao:
    medicao = db.get(Medicao, medicao_id)
    if medicao is None or medicao.usuario_id != usuario.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Medição não encontrada")
    return medicao


@router.get("", response_model=list[MedicaoSaida])
def listar(
    usuario: UsuarioAtual,
    db: DbSessao,
    inicio: AwareDatetime | None = None,
    fim: AwareDatetime | None = None,
    limite: int = Query(500, ge=1, le=5000),
) -> Sequence[Medicao]:
    consulta = select(Medicao).where(Medicao.usuario_id == usuario.id)
    if inicio is not None:
        consulta = consulta.where(Medicao.data_hora >= para_utc(inicio))
    if fim is not None:
        consulta = consulta.where(Medicao.data_hora <= para_utc(fim))
    consulta = consulta.order_by(Medicao.data_hora.desc()).limit(limite)
    return db.scalars(consulta).all()


@router.post("", response_model=MedicaoSaida, status_code=status.HTTP_201_CREATED)
def criar(dados: MedicaoEntrada, usuario: UsuarioAtual, db: DbSessao) -> Medicao:
    medicao = Medicao(usuario_id=usuario.id, valor=dados.valor, data_hora=para_utc(dados.data_hora))
    db.add(medicao)
    db.commit()
    db.refresh(medicao)
    return medicao


@router.put("/{medicao_id}", response_model=MedicaoSaida)
def atualizar(
    medicao_id: int, dados: MedicaoEntrada, usuario: UsuarioAtual, db: DbSessao
) -> Medicao:
    medicao = _buscar(db, usuario, medicao_id)
    medicao.valor = dados.valor
    medicao.data_hora = para_utc(dados.data_hora)
    db.commit()
    db.refresh(medicao)
    return medicao


@router.delete("/{medicao_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir(medicao_id: int, usuario: UsuarioAtual, db: DbSessao) -> None:
    db.delete(_buscar(db, usuario, medicao_id))
    db.commit()
