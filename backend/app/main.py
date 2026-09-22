from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.routers import auth, conta, estatisticas, exportacao, medicoes

app = FastAPI(title="Glicemia API", version="0.1.0")

app.include_router(auth.router)
app.include_router(conta.router)
app.include_router(medicoes.router)
app.include_router(estatisticas.router)
app.include_router(exportacao.router)


@app.get("/api/saude", tags=["infra"])
def saude() -> dict[str, str]:
    return {"status": "ok"}


# Em produção o FastAPI também entrega o frontend compilado (frontend/dist),
# assim tudo roda num único serviço e na mesma origem (cookies simples, sem CORS).
FRONTEND_DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"

if FRONTEND_DIST.is_dir():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/{caminho:path}", include_in_schema=False)
    def spa(caminho: str) -> FileResponse:
        if caminho.startswith("api/"):
            raise HTTPException(404, "Rota não encontrada")
        arquivo = (FRONTEND_DIST / caminho).resolve()
        if caminho and arquivo.is_file() and FRONTEND_DIST in arquivo.parents:
            return FileResponse(arquivo)
        return FileResponse(FRONTEND_DIST / "index.html")
