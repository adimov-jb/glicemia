"""Faixas de glicemia (mg/dL). Ver PROJETO.md, seção 5."""

from enum import StrEnum

VALOR_MIN = 20  # limites típicos de leitura dos glicosímetros
VALOR_MAX = 600

ALVO_MIN = 70
ALVO_MAX = 180


class Faixa(StrEnum):
    HIPO_GRAVE = "hipo_grave"
    HIPO = "hipo"
    ALVO = "alvo"
    ALTO = "alto"
    MUITO_ALTO = "muito_alto"


ROTULOS = {
    Faixa.HIPO_GRAVE: "Hipoglicemia grave",
    Faixa.HIPO: "Hipoglicemia",
    Faixa.ALVO: "No alvo",
    Faixa.ALTO: "Alto",
    Faixa.MUITO_ALTO: "Muito alto",
}


def classificar(valor: int) -> Faixa:
    if valor < 54:
        return Faixa.HIPO_GRAVE
    if valor < ALVO_MIN:
        return Faixa.HIPO
    if valor <= ALVO_MAX:
        return Faixa.ALVO
    if valor <= 250:
        return Faixa.ALTO
    return Faixa.MUITO_ALTO
