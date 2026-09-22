# Glicemia

App web responsivo para registrar e acompanhar medições de glicemia (diabetes tipo 2, uso pessoal).
Premissas e decisões do projeto: [PROJETO.md](PROJETO.md).

**Stack:** FastAPI · SQLAlchemy · Alembic · PostgreSQL (SQLite em desenvolvimento) · React · Vite · TypeScript · Tailwind CSS · Recharts

## Estrutura

```
backend/
  app/
    main.py            # app FastAPI; em produção também serve o frontend compilado
    config.py          # configurações via variáveis de ambiente (.env)
    database.py        # engine e sessão do SQLAlchemy
    models.py          # tabelas: usuarios, medicoes
    schemas.py         # modelos Pydantic de entrada/saída da API
    classificacao.py   # faixas de glicemia (hipo grave … muito alto)
    security.py        # hash de senha (argon2) e sessão JWT em cookie HttpOnly
    deps.py            # dependências: sessão do banco, usuário autenticado
    servicos.py        # estatísticas e consultas por período
    cli.py             # criação do usuário (não há cadastro aberto)
    routers/           # auth, conta, medicoes, estatisticas, exportacao
  alembic/             # migrations do banco
  tests/               # pytest
frontend/
  src/
    api/               # cliente HTTP e tipos da API
    contexto/Auth.tsx  # estado de autenticação
    componentes/       # Layout, FormMedicao, ListaMedicoes, GraficoGlicemia…
    paginas/           # Login, Painel, Historico, Conta
    lib/               # faixas (cores/ícones) e formatação pt-BR
```

## Rodando com Docker (recomendado)

Pré-requisito: apenas o **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**.
Não é preciso instalar Python, Node nem PostgreSQL.

```powershell
docker compose up --build                                            # 1ª vez (depois: docker compose up)
docker compose exec backend python -m app.cli criar-usuario voce@exemplo.com   # em outro terminal, uma vez só
```

- App: http://localhost:5173
- API e documentação: http://localhost:8000/docs

O código é montado nos contêineres: alterações em `backend/` e `frontend/` recarregam sozinhas.
O banco (PostgreSQL) fica no volume `dados-postgres` e sobrevive a reinícios.

| Tarefa | Comando |
|---|---|
| Rodar os testes | `docker compose run --rm backend pytest` |
| Parar | `Ctrl+C` ou `docker compose down` |
| Apagar também o banco | `docker compose down -v` |
| Nova migration após mudar `models.py` | `docker compose exec backend alembic revision --autogenerate -m "descrição"` |
| Depois de mudar `requirements*.txt` | `docker compose up --build` |
| Depois de mudar `package.json` | `docker compose restart frontend` |

### Imagem de produção

O `Dockerfile` (estágio `prod`) compila o frontend e gera uma imagem única com o backend:

```powershell
docker build -t glicemia .
docker run -p 8000:8000 -e DATABASE_URL=postgresql://... -e SECRET_KEY=... glicemia
```

## Rodando sem Docker

Pré-requisitos: **Python 3.12+** e **Node 20+**.

### Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1          # Linux/macOS: source .venv/bin/activate
pip install -r requirements-dev.txt
copy .env.example .env              # Linux/macOS: cp .env.example .env
alembic upgrade head                # cria as tabelas
python -m app.cli criar-usuario voce@exemplo.com
uvicorn app.main:app --reload       # http://localhost:8000/docs
```

### Frontend

```powershell
cd frontend
npm install
npm run dev                          # http://localhost:5173 (encaminha /api para o backend)
```

### Testes

```powershell
cd backend
pytest
```

## API

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Login (define cookie de sessão) |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Usuário logado |
| GET | `/api/medicoes?inicio=&fim=&limite=` | Lista medições (mais recentes primeiro) |
| POST | `/api/medicoes` | Cria medição `{valor, data_hora}` |
| PUT | `/api/medicoes/{id}` | Edita medição |
| DELETE | `/api/medicoes/{id}` | Exclui medição |
| GET | `/api/estatisticas?dias=14` | Média, mín/máx, % no alvo, hipoglicemias |
| GET | `/api/exportar/csv?dias=` | Exporta CSV |
| POST | `/api/conta/trocar-senha` | Troca a senha |
| DELETE | `/api/conta/dados` | Apaga todas as medições |

Documentação interativa em `/docs` com o backend rodando.

## Deploy (serviço único)

O FastAPI entrega o frontend compilado, então basta um serviço web + um PostgreSQL
(Render, Railway ou Fly.io). O mais simples é apontar o serviço para o `Dockerfile`
do repositório: ele já roda as migrations ao iniciar e usa a variável `PORT` do provedor.

Sem Docker, configure:

- **Build:** `cd frontend && npm ci && npm run build && cd ../backend && pip install -r requirements.txt`
- **Start:** `cd backend && alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Variáveis:** `AMBIENTE=producao`, `DATABASE_URL` (do PostgreSQL), `SECRET_KEY` (aleatória e longa)
- Depois do primeiro deploy, crie o usuário pelo shell do serviço: `python -m app.cli criar-usuario …`

---

*Este aplicativo não substitui orientação médica.*
