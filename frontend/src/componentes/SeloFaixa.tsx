import type { Faixa } from "../api/tipos";
import { FAIXAS } from "../lib/faixas";

export default function SeloFaixa({ faixa }: { faixa: Faixa }) {
  const info = FAIXAS[faixa];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${info.classes}`}
    >
      <span aria-hidden="true">{info.icone}</span>
      {info.rotulo}
    </span>
  );
}
