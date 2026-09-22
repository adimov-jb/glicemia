import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import Usuario
from app.security import gerar_hash_senha

EMAIL = "teste@exemplo.com"
SENHA = "senha-segura-123"


@pytest.fixture
def db():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    sessao_factory = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    with sessao_factory() as sessao:
        yield sessao
    engine.dispose()


@pytest.fixture
def cliente(db: Session):
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def criar_usuario(db: Session, email: str = EMAIL, senha: str = SENHA) -> Usuario:
    usuario = Usuario(email=email, senha_hash=gerar_hash_senha(senha))
    db.add(usuario)
    db.commit()
    return usuario


@pytest.fixture
def usuario(db: Session) -> Usuario:
    return criar_usuario(db)


@pytest.fixture
def cliente_logado(cliente: TestClient, usuario: Usuario) -> TestClient:
    resposta = cliente.post("/api/auth/login", json={"email": EMAIL, "senha": SENHA})
    assert resposta.status_code == 200
    return cliente
