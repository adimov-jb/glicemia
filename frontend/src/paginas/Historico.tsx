import { useCallback, useEffect, useState } from "react";
import { api, mensagemDeErro } from "../api/cliente";
import type { Medicao, MedicaoEntrada } from "../api/tipos";
import Cartao from "../componentes/Cartao";
import ListaMedicoes from "../componentes/ListaMedicoes";
import SeletorPeriodo from "../componentes/SeletorPeriodo";
import { inicioDoPeriodo } from "../lib/formato";

const PERIODOS = [7, 30, 90, null] as const;
type Periodo = (typeof PERIODOS)[number];

export default function Historico() {
  const [dias, setDias] = useState<Periodo>(30);
  const [medicoes, setMedicoes] = useState<Medicao[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      setMedicoes(
        await api.listarMedicoes({ inicio: dias ? inicioDoPeriodo(dias) : undefined, limite: 5000 }),
      );
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  }, [dias]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function atualizar(id: number, dados: MedicaoEntrada) {
    await api.atualizarMedicao(id, dados);
    await carregar();
  }

  async function excluir(id: number) {
    try {
      await api.excluirMedicao(id);
      await carregar();
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Histórico</h1>
        <div className="flex flex-wrap items-center gap-2">
          <SeletorPeriodo opcoes={PERIODOS} valor={dias} aoMudar={setDias} />
          <a
            href={api.urlCsv(dias)}
            download
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Exportar CSV
          </a>
        </div>
      </div>

      {erro && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {erro}
        </p>
      )}

      <Cartao>
        <ListaMedicoes medicoes={medicoes} aoAtualizar={atualizar} aoExcluir={excluir} />
      </Cartao>
    </div>
  );
}
