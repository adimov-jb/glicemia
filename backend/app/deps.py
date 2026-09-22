from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Usuario
from app.security import COOKIE_SESSAO, ler_token

DbSessao = Annotated[Session, Depends(get_db)]


def get_usuario_atual(
    db: DbSessao, token: Annotated[str | None, Cookie(alias=COOKIE_SESSAO)] = None
) -> Usuario:
    usuario_id = ler_token(token) if token else None
    usuario = db.get(Usuario, usuario_id) if usuario_id else None
    if usuario is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Não autenticado")
    return usuario


UsuarioAtual = Annotated[Usuario, Depends(get_usuario_atual)]
