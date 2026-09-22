import csv
import io
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Query, Response

from app.classificacao import ROTULOS, classificar
from app.config import get_settings
from app.datas import para_utc
from app.deps import DbSessao, UsuarioAtual
from app.servicos import medicoes_do_periodo

router = APIRouter(prefix="/api/exportar", tags=["exportação"])


@router.get("/csv")
def exportar_csv(
    usuario: UsuarioAtual, db: DbSessao, dias: int | None = Query(None, ge=1, le=3650)
) -> Response:
    fuso = ZoneInfo(get_settings().fuso_horario)
    buffer = io.StringIO()
    # Ponto e vírgula: separador que o Excel em português reconhece.
    escritor = csv.writer(buffer, delimiter=";")
    escritor.writerow(["data", "hora", "glicemia_mg_dl", "faixa"])
    for medicao in medicoes_do_periodo(db, usuario.id, dias):
        local = para_utc(medicao.data_hora).astimezone(fuso)
        escritor.writerow(
            [
                local.strftime("%d/%m/%Y"),
                local.strftime("%H:%M"),
                medicao.valor,
                ROTULOS[classificar(medicao.valor)],
            ]
        )

    # BOM para o Excel abrir o arquivo como UTF-8.
    return Response(
        "﻿" + buffer.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="glicemia.csv"'},
    )
