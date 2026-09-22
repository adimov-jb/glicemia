from fastapi import APIRouter, Query

from app.deps import DbSessao, UsuarioAtual
from app.schemas import Estatisticas
from app.servicos import calcular_estatisticas

router = APIRouter(prefix="/api/estatisticas", tags=["estatísticas"])


@router.get("", response_model=Estatisticas)
def obter(usuario: UsuarioAtual, db: DbSessao, dias: int = Query(14, ge=1, le=365)) -> Estatisticas:
    return calcular_estatisticas(db, usuario.id, dias)
