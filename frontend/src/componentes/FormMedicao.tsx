import { useState, type FormEvent } from "react";
import { mensagemDeErro } from "../api/cliente";
import type { Medicao, MedicaoEntrada } from "../api/tipos";
import { VALOR_MAX, VALOR_MIN } from "../lib/faixas";
import { deInputLocal, paraInputLocal } from "../lib/formato";

interface Props {
  inicial?: Medicao;
  aoSalvar: (dados: MedicaoEntrada) => Promise<void>;
  aoCancelar?: () => void;
}

export default function FormMedicao({ inicial, aoSalvar, aoCancelar }: Props) {
  const [valor, setValor] = useState(inicial ? String(inicial.valor) : "");
  const [dataHora, setDataHora] = useState(
    paraInputLocal(inicial ? new Date(inicial.data_hora) : new Date()),
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      await aoSalvar({ valor: Number(valor), data_hora: deInputLocal(dataHora) });
      if (!inicial) {
        setValor("");
        setDataHora(paraInputLocal(new Date()));
      }
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setSalvando(false);
    }
  }

  const campo =
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none";

  return (
    <form onSubmit={enviar} className="flex flex-wrap items-end gap-3">
      <label className="flex-1 basis-32">
        <span className="mb-1 block text-sm font-medium text-slate-700">Glicemia (mg/dL)</span>
        <input
          type="number"
          inputMode="numeric"
          required
          min={VALOR_MIN}
          max={VALOR_MAX}
          step={1}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className={campo}
          autoFocus={!inicial}
        />
      </label>
      <label className="flex-1 basis-48">
        <span className="mb-1 block text-sm font-medium text-slate-700">Data e hora</span>
        <input
          type="datetime-local"
          required
          value={dataHora}
          onChange={(e) => setDataHora(e.target.value)}
          className={campo}
        />
      </label>
      <div className="flex w-full gap-2 sm:w-auto">
        <button
          type="submit"
          disabled={salvando}
          className="min-h-11 flex-1 rounded-lg bg-emerald-600 px-5 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {salvando ? "Salvando…" : inicial ? "Salvar" : "Registrar"}
        </button>
        {aoCancelar && (
          <button
            type="button"
            onClick={aoCancelar}
            className="min-h-11 flex-1 rounded-lg border border-slate-300 px-4 font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
        )}
      </div>
      {erro && (
        <p role="alert" className="w-full text-sm text-red-700">
          {erro}
        </p>
      )}
    </form>
  );
}
