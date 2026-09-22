from datetime import datetime

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, computed_field, field_validator

from app.classificacao import VALOR_MAX, VALOR_MIN, Faixa, classificar
from app.datas import para_utc


class LoginEntrada(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    senha: str = Field(min_length=1)


class UsuarioSaida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str


class TrocaSenhaEntrada(BaseModel):
    senha_atual: str
    senha_nova: str = Field(min_length=8)


class MedicaoEntrada(BaseModel):
    valor: int = Field(ge=VALOR_MIN, le=VALOR_MAX)
    data_hora: AwareDatetime


class MedicaoSaida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    valor: int
    data_hora: datetime

    @field_validator("data_hora")
    @classmethod
    def normalizar_utc(cls, valor: datetime) -> datetime:
        return para_utc(valor)

    @computed_field
    @property
    def faixa(self) -> Faixa:
        return classificar(self.valor)


class Estatisticas(BaseModel):
    dias: int
    quantidade: int
    media: float | None
    minimo: int | None
    maximo: int | None
    percentual_alvo: float | None
    hipoglicemias: int
