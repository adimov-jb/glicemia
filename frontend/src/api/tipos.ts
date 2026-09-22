export type Faixa = "hipo_grave" | "hipo" | "alvo" | "alto" | "muito_alto";

export interface Usuario {
  id: number;
  email: string;
  nome: string | null;
}

export interface Medicao {
  id: number;
  valor: number;
  data_hora: string;
  faixa: Faixa;
}

export interface MedicaoEntrada {
  valor: number;
  data_hora: string;
}

export interface Estatisticas {
  dias: number;
  quantidade: number;
  media: number | null;
  minimo: number | null;
  maximo: number | null;
  percentual_alvo: number | null;
  hipoglicemias: number;
}
