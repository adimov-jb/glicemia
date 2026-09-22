from fastapi import APIRouter, HTTPException, Response, status
from sqlalchemy import select

from app.deps import DbSessao, UsuarioAtual
from app.models import Usuario
from app.schemas import LoginEntrada, UsuarioSaida
from app.security import (
    criar_token,
    definir_cookie_sessao,
    remover_cookie_sessao,
    verificar_senha,
)

router = APIRouter(prefix="/api/auth", tags=["autenticação"])


@router.post("/login", response_model=UsuarioSaida)
def login(dados: LoginEntrada, response: Response, db: DbSessao) -> Usuario:
    email = dados.email.strip().lower()
    usuario = db.scalar(select(Usuario).where(Usuario.email == email))
    if usuario is None or not verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "E-mail ou senha inválidos")
    definir_cookie_sessao(response, criar_token(usuario.id))
    return usuario


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> None:
    remover_cookie_sessao(response)


@router.get("/me", response_model=UsuarioSaida)
def eu(usuario: UsuarioAtual) -> Usuario:
    return usuario
