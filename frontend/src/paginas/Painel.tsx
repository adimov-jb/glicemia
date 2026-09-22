import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, mensagemDeErro } from "../api/cliente";
import type { Estatisticas, Medicao, MedicaoEntrada } from "../api/tipos";
import Cartao from "../componentes/Cartao";
import FormMedicao from "../componentes/FormMedicao";
import GraficoGlicemia from "../componentes/GraficoGlicemia";
import ListaMedicoes from "../componentes/ListaMedicoes";
import SeletorPeriodo from "../componentes/SeletorPeriodo";
import { useAuth } from "../contexto/Auth";
import { ALVO_MAX, ALVO_MIN } from "../lib/faixas";
import { formatarNumero, inicioDoPeriodo } from "../lib/formato";

const PERIODOS = [7, 14, 30, 90] as const;
const RECENTES = 5;

function Indicador({ titulo, valor, detalhe }: { titulo: string; valor: string; detalhe?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{titulo}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{valor}</p>
      {detalhe && <p className="mt-0.5 text-xs text-slate-500">{detalhe}</p>}
    </div>
  );
}

export default function Painel() {
  const { usuario } = useAuth();
  const [dias, setDias] = useState<(typeof PERIODOS)[number]>(14);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [medicoes, setMedicoes] = useState<Medicao[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      const [stats, lista] = await Promise.all([
        api.estatisticas(dias),
        api.listarMedicoes({ inicio: inicioDoPeriodo(dias), limite: 5000 }),
      ]);
      setEstatisticas(stats);
      setMedicoes(lista);
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  }, [dias]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function registrar(dados: MedicaoEntrada) {
    await api.criarMedicao(dados);
    await carregar();
  }

  const s = estatisticas;
  const vazio = "—";

  return (
    <div className="space-y-6">
      {usuario?.nome && <p className="text-lg font-medium">Olá, {usuario.nome}</p>}

      <Cartao titulo="Nova medição">
        <FormMedicao aoSalvar={registrar} />
      </Cartao>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Resumo</h1>
        <SeletorPeriodo opcoes={PERIODOS} valor={dias}aoMudar={setDias} />
      </div>

      {erro && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {erro}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Indicador
          titulo="Média"
          valor={s?.media != null ? `${formatarNumero(s.media)} mg/dL` : vazio}
          detalhe={s ? `${s.quantidade} medições` : undefined}
        />
        <Indicador
          titulo="Mín. / Máx."
          valor={s?.minimo != null ? `${s.minimo} / ${s.maximo}` : vazio}
          detalhe="mg/dL"
        />
        <Indicador
          titulo="No alvo"
          valor={s?.percentual_alvo != null ? `${formatarNumero(s.percentual_alvo)}%` : vazio}
          detalhe={`${ALVO_MIN}–${ALVO_MAX} mg/dL`}
        />
        <Indicador
          titulo="Hipoglicemias"
          valor={s ? String(s.hipoglicemias) : vazio}
          detalhe={`abaixo de ${ALVO_MIN} mg/dL`}
        />
      </div>

      <Cartao titulo="Evolução">
        <GraficoGlicemia medicoes={medicoes} />
      </Cartao>

      <Cartao titulo="Últimas medições">
        <ListaMedicoes medicoes={medicoes.slice(0, RECENTES)} />
        <Link to="/historico" className="mt-2 inline-block text-sm font-medium text-emerald-700 hover:underline">
          Ver histórico completo →
        </Link>
      </Cartao>
    </div>
  );
}
