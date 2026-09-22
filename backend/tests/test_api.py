from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from tests.conftest import criar_usuario


def agora_menos(**delta) -> str:
    return (datetime.now(UTC) - timedelta(**delta)).isoformat()


def test_login_com_senha_errada(cliente: TestClient, usuario):
    resposta = cliente.post("/api/auth/login", json={"email": usuario.email, "senha": "errada"})
    assert resposta.status_code == 401


def test_rotas_exigem_login(cliente: TestClient):
    assert cliente.get("/api/medicoes").status_code == 401
    assert cliente.get("/api/estatisticas").status_code == 401


def test_logout_encerra_sessao(cliente_logado: TestClient):
    assert cliente_logado.get("/api/auth/me").status_code == 200
    cliente_logado.post("/api/auth/logout")
    assert cliente_logado.get("/api/auth/me").status_code == 401


def test_ciclo_de_vida_da_medicao(cliente_logado: TestClient):
    criada = cliente_logado.post(
        "/api/medicoes", json={"valor": 110, "data_hora": agora_menos(hours=1)}
    )
    assert criada.status_code == 201
    medicao = criada.json()
    assert medicao["faixa"] == "alvo"

    assert [m["id"] for m in cliente_logado.get("/api/medicoes").json()] == [medicao["id"]]

    atualizada = cliente_logado.put(
        f"/api/medicoes/{medicao['id']}", json={"valor": 45, "data_hora": medicao["data_hora"]}
    )
    assert atualizada.json()["faixa"] == "hipo_grave"

    assert cliente_logado.delete(f"/api/medicoes/{medicao['id']}").status_code == 204
    assert cliente_logado.get("/api/medicoes").json() == []


def test_valida_valor_e_fuso(cliente_logado: TestClient):
    fora_da_faixa = {"valor": 700, "data_hora": agora_menos(hours=1)}
    sem_fuso = {"valor": 100, "data_hora": "2026-09-22T10:00:00"}
    assert cliente_logado.post("/api/medicoes", json=fora_da_faixa).status_code == 422
    assert cliente_logado.post("/api/medicoes", json=sem_fuso).status_code == 422


def test_estatisticas_do_periodo(cliente_logado: TestClient):
    for valor in (50, 100, 200):
        cliente_logado.post("/api/medicoes", json={"valor": valor, "data_hora": agora_menos(hours=2)})
    # Fora do período de 7 dias: não deve entrar no cálculo.
    cliente_logado.post("/api/medicoes", json={"valor": 300, "data_hora": agora_menos(days=10)})

    stats = cliente_logado.get("/api/estatisticas", params={"dias": 7}).json()
    assert stats == {
        "dias": 7,
        "quantidade": 3,
        "media": 116.7,
        "minimo": 50,
        "maximo": 200,
        "percentual_alvo": 33.3,
        "hipoglicemias": 1,
    }


def test_estatisticas_sem_medicoes(cliente_logado: TestClient):
    stats = cliente_logado.get("/api/estatisticas").json()
    assert stats["quantidade"] == 0
    assert stats["media"] is None
    assert stats["percentual_alvo"] is None


def test_usuario_nao_acessa_medicao_de_outro(cliente_logado: TestClient, db: Session):
    medicao = cliente_logado.post(
        "/api/medicoes", json={"valor": 100, "data_hora": agora_menos(hours=1)}
    ).json()

    criar_usuario(db, email="outro@exemplo.com", senha="outra-senha-123")
    cliente_logado.post(
        "/api/auth/login", json={"email": "outro@exemplo.com", "senha": "outra-senha-123"}
    )

    assert cliente_logado.get("/api/medicoes").json() == []
    assert cliente_logado.delete(f"/api/medicoes/{medicao['id']}").status_code == 404


def test_exportar_csv(cliente_logado: TestClient):
    cliente_logado.post("/api/medicoes", json={"valor": 260, "data_hora": agora_menos(hours=1)})
    resposta = cliente_logado.get("/api/exportar/csv")
    assert resposta.status_code == 200
    linhas = resposta.content.decode("utf-8-sig").strip().splitlines()
    assert linhas[0] == "data;hora;glicemia_mg_dl;faixa"
    assert linhas[1].endswith(";260;Muito alto")


def test_apagar_todos_os_dados(cliente_logado: TestClient):
    cliente_logado.post("/api/medicoes", json={"valor": 100, "data_hora": agora_menos(hours=1)})
    assert cliente_logado.delete("/api/conta/dados").status_code == 204
    assert cliente_logado.get("/api/medicoes").json() == []


def test_trocar_senha(cliente_logado: TestClient, usuario):
    errada = {"senha_atual": "errada", "senha_nova": "nova-senha-123"}
    assert cliente_logado.post("/api/conta/trocar-senha", json=errada).status_code == 400

    certa = {"senha_atual": "senha-segura-123", "senha_nova": "nova-senha-123"}
    assert cliente_logado.post("/api/conta/trocar-senha", json=certa).status_code == 204
    login = {"email": usuario.email, "senha": "nova-senha-123"}
    assert cliente_logado.post("/api/auth/login", json=login).status_code == 200
