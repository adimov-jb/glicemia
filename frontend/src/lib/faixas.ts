import type { Faixa } from "../api/tipos";

// Espelha backend/app/classificacao.py. A faixa de cada medição vem da API;
// aqui ficam apenas os limites usados na interface e a apresentação visual.
export const VALOR_MIN = 20;
export const VALOR_MAX = 600;
export const ALVO_MIN = 70;
export const ALVO_MAX = 180;

interface InfoFaixa {
  rotulo: string;
  icone: string; // a faixa nunca é indicada só pela cor
  classes: string;
  cor: string;
}

export const FAIXAS: Record<Faixa, InfoFaixa> = {
  hipo_grave: {
    rotulo: "Hipoglicemia grave",
    icone: "▼▼",
    classes: "bg-red-100 text-red-800 ring-red-300",
    cor: "#b91c1c",
  },
  hipo: {
    rotulo: "Hipoglicemia",
    icone: "▼",
    classes: "bg-red-50 text-red-700 ring-red-200",
    cor: "#ef4444",
  },
  alvo: {
    rotulo: "No alvo",
    icone: "●",
    classes: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    cor: "#059669",
  },
  alto: {
    rotulo: "Alto",
    icone: "▲",
    classes: "bg-amber-50 text-amber-800 ring-amber-200",
    cor: "#d97706",
  },
  muito_alto: {
    rotulo: "Muito alto",
    icone: "▲▲",
    classes: "bg-orange-100 text-orange-900 ring-orange-300",
    cor: "#c2410c",
  },
};
