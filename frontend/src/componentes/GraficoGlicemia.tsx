import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Faixa, Medicao } from "../api/tipos";
import { ALVO_MAX, ALVO_MIN, FAIXAS } from "../lib/faixas";
import { formatarDataHora, formatarDiaMes } from "../lib/formato";

interface Ponto {
  tempo: number;
  valor: number;
  faixa: Faixa;
}

function PontoFaixa({ cx, cy, payload }: { cx?: number; cy?: number; payload?: Ponto }) {
  if (cx == null || cy == null || !payload) return null;
  return <circle cx={cx} cy={cy} r={4} fill={FAIXAS[payload.faixa].cor} stroke="white" strokeWidth={1} />;
}

export default function GraficoGlicemia({ medicoes }: { medicoes: Medicao[] }) {
  const pontos = useMemo<Ponto[]>(
    () =>
      medicoes
        .map((m) => ({ tempo: new Date(m.data_hora).getTime(), valor: m.valor, faixa: m.faixa }))
        .sort((a, b) => a.tempo - b.tempo),
    [medicoes],
  );

  if (!pontos.length) {
    return <p className="py-12 text-center text-sm text-slate-500">Nenhuma medição no período.</p>;
  }

  const yMax = Math.max(300, ...pontos.map((p) => p.valor)) + 20;

  return (
    <div className="h-64 w-full sm:h-80" role="img" aria-label="Gráfico da glicemia no período">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={pontos} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <ReferenceArea y1={ALVO_MIN} y2={ALVO_MAX} fill="#10b981" fillOpacity={0.1} />
          <XAxis
            dataKey="tempo"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickFormatter={formatarDiaMes}
            fontSize={12}
            stroke="#64748b"
          />
          <YAxis domain={[0, yMax]} fontSize={12} stroke="#64748b" />
          <Tooltip
            labelFormatter={(tempo) => formatarDataHora(Number(tempo))}
            formatter={(valor) => [`${valor} mg/dL`, "Glicemia"]}
          />
          <Line
            type="linear"
            dataKey="valor"
            stroke="#94a3b8"
            strokeWidth={1.5}
            dot={<PontoFaixa />}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
