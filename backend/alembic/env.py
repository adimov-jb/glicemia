from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine

from app import models  # noqa: F401  (registra as tabelas no metadata)
from app.config import get_settings
from app.database import Base

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

URL = get_settings().database_url
METADATA = Base.metadata
# SQLite não suporta ALTER TABLE completo; o modo batch recria a tabela.
BATCH = URL.startswith("sqlite")


def rodar_offline() -> None:
    context.configure(
        url=URL, target_metadata=METADATA, literal_binds=True, render_as_batch=BATCH
    )
    with context.begin_transaction():
        context.run_migrations()


def rodar_online() -> None:
    engine = create_engine(URL)
    with engine.connect() as conexao:
        context.configure(connection=conexao, target_metadata=METADATA, render_as_batch=BATCH)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    rodar_offline()
else:
    rodar_online()
