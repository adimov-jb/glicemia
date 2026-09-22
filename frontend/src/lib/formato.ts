const DIA_POR_MS = 24 * 60 * 60 * 1000;

const fmtDataHora = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
const fmtDiaMes = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

export const formatarDataHora = (data: string | number | Date) => fmtDataHora.format(new Date(data));
export const formatarDiaMes = (data: string | number | Date) => fmtDiaMes.format(new Date(data));

export const formatarNumero = (valor: number, casas = 0) =>
  valor.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });

/** ISO do instante `dias` atrás, para filtrar a API. */
export const inicioDoPeriodo = (dias: number) => new Date(Date.now() - dias * DIA_POR_MS).toISOString();

/** Date -> "aaaa-mm-ddThh:mm" no horário local, formato do <input type="datetime-local">. */
export function paraInputLocal(data: Date): string {
  const local = new Date(data.getTime() - data.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

/** Valor do <input type="datetime-local"> (horário local) -> ISO em UTC. */
export const deInputLocal = (valor: string) => new Date(valor).toISOString();
