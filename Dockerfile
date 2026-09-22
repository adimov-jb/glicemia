# Estágios:
#   dev  -> backend com dependências de desenvolvimento (usado pelo docker-compose.yml)
#   prod -> imagem final: backend + frontend compilado, num único serviço

# ---------- Frontend (build) ----------
FROM node:22-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---------- Base Python ----------
FROM python:3.12-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1
WORKDIR /app/backend

# ---------- Desenvolvimento ----------
FROM base AS dev
COPY backend/requirements.txt backend/requirements-dev.txt ./
RUN pip install -r requirements-dev.txt
COPY backend/ ./
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# ---------- Produção ----------
FROM base AS prod
COPY backend/requirements.txt ./
RUN pip install -r requirements.txt
COPY backend/ ./
# O FastAPI procura o frontend em /app/frontend/dist (ver app/main.py).
COPY --from=frontend /app/frontend/dist /app/frontend/dist
RUN useradd --create-home app
USER app
ENV AMBIENTE=producao PORT=8000
EXPOSE 8000
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
