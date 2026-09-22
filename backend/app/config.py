from functools import lru_cache
from typing import Literal

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

CHAVE_PADRAO = "troque-esta-chave"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ambiente: Literal["desenvolvimento", "producao"] = "desenvolvimento"
    database_url: str = "sqlite:///./glicemia.db"
    secret_key: str = CHAVE_PADRAO
    token_expira_minutos: int = 60 * 24 * 7
    fuso_horario: str = "America/Sao_Paulo"

    @field_validator("database_url")
    @classmethod
    def usar_driver_psycopg(cls, url: str) -> str:
        # Serviços como Render/Railway fornecem "postgres://" ou "postgresql://";
        # o SQLAlchemy precisa do driver explícito para usar o psycopg 3.
        if url.startswith("postgres://"):
            url = "postgresql://" + url.removeprefix("postgres://")
        if url.startswith("postgresql://"):
            url = "postgresql+psycopg://" + url.removeprefix("postgresql://")
        return url

    @model_validator(mode="after")
    def exigir_chave_em_producao(self) -> "Settings":
        if self.ambiente == "producao" and self.secret_key == CHAVE_PADRAO:
            raise ValueError("Defina SECRET_KEY em produção.")
        return self

    @property
    def em_producao(self) -> bool:
        return self.ambiente == "producao"


@lru_cache
def get_settings() -> Settings:
    return Settings()
