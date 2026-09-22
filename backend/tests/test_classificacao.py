import pytest

from app.classificacao import Faixa, classificar


@pytest.mark.parametrize(
    ("valor", "esperado"),
    [
        (20, Faixa.HIPO_GRAVE),
        (53, Faixa.HIPO_GRAVE),
        (54, Faixa.HIPO),
        (69, Faixa.HIPO),
        (70, Faixa.ALVO),
        (180, Faixa.ALVO),
        (181, Faixa.ALTO),
        (250, Faixa.ALTO),
        (251, Faixa.MUITO_ALTO),
        (600, Faixa.MUITO_ALTO),
    ],
)
def test_limites_das_faixas(valor: int, esperado: Faixa):
    assert classificar(valor) == esperado
