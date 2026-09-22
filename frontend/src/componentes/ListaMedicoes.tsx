import { useState } from "react";
import type { Medicao, MedicaoEntrada } from "../api/tipos";
import { formatarDataHora } from "../lib/formato";
import FormMedicao from "./FormMedicao";
import SeloFaixa from "./SeloFaixa";

interface Props {
  medicoes: Medicao[];
  aoAtualizar?: (id: number, dados: MedicaoEntrada) => Promise<void>;
  aoExcluir?: (id: number) => Promise<void>;
}

export default function ListaMedicoes({ medicoes, aoAtualizar, aoExcluir }: Props) {
  const [editandoId, setEditandoId] = useState<number | null>(null);

  if (!medicoes.length) {
    return <p className="py-6 text-center text-sm text-slate-500">Nenhuma medição no período.</p>;
  }

  return (
    <ul className="divide-y divide-slate-100">
      {medicoes.map((medicao) => (
        <li key={medicao.id} className="py-3">
          {editandoId === medicao.id && aoAtualizar ? (
            <FormMedicao
              inicial={medicao}
              aoSalvar={async (dados) => {
                await aoAtualizar(medicao.id, dados);
                setEditandoId(null);
              }}
              aoCancelar={() => setEditandoId(null)}
            />
          ) : (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="w-32 text-sm text-slate-500 tabular-nums">
                {formatarDataHora(medicao.data_hora)}
              </span>
              <span className="w-24 font-semibold tabular-nums">
                {medicao.valor} <span className="text-xs font-normal text-slate-500">mg/dL</span>
              </span>
              <SeloFaixa faixa={medicao.faixa} />
              {(aoAtualizar || aoExcluir) && (
                <span className="ml-auto flex gap-1">
                  {aoAtualizar && (
                    <button
                      onClick={() => setEditandoId(medicao.id)}
                      className="rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                    >
                      Editar
                    </button>
                  )}
                  {aoExcluir && (
                    <button
                      onClick={() => {
                        if (window.confirm("Excluir esta medição?")) void aoExcluir(medicao.id);
                      }}
                      className="rounded-md px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      Excluir
                    </button>
                  )}
                </span>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
