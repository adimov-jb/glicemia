from datetime import UTC, datetime, timedelta

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError
from fastapi import Response

from app.config import get_settings

COOKIE_SESSAO = "sessao"
_ALGORITMO = "HS256"
_hasher = PasswordHasher()


def gerar_hash_senha(senha: str) -> str:
    return _hasher.hash(senha)


def verificar_senha(senha: str, senha_hash: str) -> bool:
    try:
        return _hasher.verify(senha_hash, senha)
    except (VerifyMismatchError, InvalidHashError):
        return False


def criar_token(usuario_id: int) -> str:
    settings = get_settings()
    expira = datetime.now(UTC) + timedelta(minutes=settings.token_expira_minutos)
    return jwt.encode({"sub": str(usuario_id), "exp": expira}, settings.secret_key, _ALGORITMO)


def ler_token(token: str) -> int | None:
    try:
        payload = jwt.decode(token, get_settings().secret_key, algorithms=[_ALGORITMO])
        return int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        return None


def definir_cookie_sessao(response: Response, token: str) -> None:
    settings = get_settings()
    # HttpOnly impede leitura via JavaScript; SameSite=Lax bloqueia envio em
    # requisições POST/PUT/DELETE vindas de outros sites (proteção CSRF).
    response.set_cookie(
        COOKIE_SESSAO,
        token,
        max_age=settings.token_expira_minutos * 60,
        httponly=True,
        secure=settings.em_producao,
        samesite="lax",
        path="/",
    )


def remover_cookie_sessao(response: Response) -> None:
    response.delete_cookie(COOKIE_SESSAO, path="/")
