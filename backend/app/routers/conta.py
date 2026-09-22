from fastapi import APIRouter, HTTPException, status
from sqlalchemy import delete

from app.deps import DbSessao, UsuarioAtual
from app.models import Medicao
from app.schemas import TrocaSenhaEntrada
from app.security import gerar_hash_senha, verificar_senha

router = APIRouter(prefix="/api/conta", tags=["conta"])


@router.post("/trocar-senha", status_code=status.HTTP_204_NO_CONTENT)
def trocar_senha(dados: TrocaSenhaEntrada, usuario: UsuarioAtual, db: DbSessao) -> None:
    if not verificar_senha(dados.senha_atual, usuario.senha_hash):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Senha atual incorreta")
    usuario.senha_hash = gerar_hash_senha(dados.senha_nova)
    db.commit()


@router.delete("/dados", status_code=status.HTTP_204_NO_CONTENT)
def apagar_dados(usuario: UsuarioAtual, db: DbSessao) -> None:
    """Apaga todas as medições do usuário (direito de exclusão, LGPD)."""
    db.execute(delete(Medicao).where(Medicao.usuario_id == usuario.id))
    db.commit()
