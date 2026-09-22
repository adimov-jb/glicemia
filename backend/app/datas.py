from datetime import UTC, datetime


def para_utc(valor: datetime) -> datetime:
    """Normaliza para UTC. Valores sem fuso (ex.: lidos do SQLite) já estão em UTC."""
    if valor.tzinfo is None:
        return valor.replace(tzinfo=UTC)
    return valor.astimezone(UTC)
