"""Comandos administrativos.

O app é de uso pessoal e não tem cadastro aberto: o usuário é criado por aqui.
    python -m app.cli criar-usuario voce@exemplo.com
"""

import argparse
import getpass
import sys

from sqlalchemy import select

from app.database import SessionLocal
from app.models import Usuario
from app.security import gerar_hash_senha


def criar_usuario(email: str) -> None:
    email = email.strip().lower()
    nome = input("Nome: ").strip()
    if not nome:
        sys.exit("Informe o nome.")
    if len(nome) > 100:
        sys.exit("Nome muito longo (máx. 100 caracteres).")
    senha = getpass.getpass("Senha (mín. 8 caracteres): ")
    if len(senha) < 8:
        sys.exit("Senha muito curta.")
    if getpass.getpass("Confirme a senha: ") != senha:
        sys.exit("As senhas não conferem.")

    with SessionLocal() as db:
        if db.scalar(select(Usuario).where(Usuario.email == email)):
            sys.exit(f"Já existe um usuário com o e-mail {email}.")
        db.add(Usuario(email=email, nome=nome, senha_hash=gerar_hash_senha(senha)))
        db.commit()
    print(f"Usuário {email} criado.")


def main() -> None:
    parser = argparse.ArgumentParser(prog="python -m app.cli")
    comandos = parser.add_subparsers(dest="comando", required=True)
    cmd_criar = comandos.add_parser("criar-usuario", help="cria o usuário do app")
    cmd_criar.add_argument("email")

    args = parser.parse_args()
    if args.comando == "criar-usuario":
        criar_usuario(args.email)


if __name__ == "__main__":
    main()
