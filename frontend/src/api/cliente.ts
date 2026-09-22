import type { Estatisticas, Medicao, MedicaoEntrada, Usuario } from "./tipos";

export class ErroApi extends Error {
  constructor(
    public status: number,
    mensagem: string,
  ) {
    super(mensagem);
  }
}

let aoNaoAutenticado: (() => void) | null = null;

/** Registrado pelo ProvedorAuth: chamado quando a sessão expira. */
export function definirAoNaoAutenticado(callback: (() => void) | null) {
  aoNaoAutenticado = callback;
}

export function mensagemDeErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : "Erro inesperado";
}

async function requisicao<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const resposta = await fetch(`/api${caminho}`, {
    ...opcoes,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...opcoes.headers },
  });

  if (!resposta.ok) {
    if (resposta.status === 401 && caminho !== "/auth/login") aoNaoAutenticado?.();
    let mensagem = "Erro inesperado";
    try {
      const corpo = await resposta.json();
      if (typeof corpo.detail === "string") mensagem = corpo.detail;
      else if (Array.isArray(corpo.detail)) mensagem = "Dados inválidos";
    } catch {
      // corpo não é JSON
    }
    throw new ErroApi(resposta.status, mensagem);
  }

  if (resposta.status === 204) return undefined as T;
  return (await resposta.json()) as T;
}

const json = (dados: unknown) => JSON.stringify(dados);

export const api = {
  login: (email: string, senha: string) =>
    requisicao<Usuario>("/auth/login", { method: "POST", body: json({ email, senha }) }),
  logout: () => requisicao<void>("/auth/logout", { method: "POST" }),
  eu: () => requisicao<Usuario>("/auth/me"),

  listarMedicoes: (filtro: { inicio?: string; limite?: number } = {}) => {
    const params = new URLSearchParams();
    if (filtro.inicio) params.set("inicio", filtro.inicio);
    if (filtro.limite) params.set("limite", String(filtro.limite));
    return requisicao<Medicao[]>(`/medicoes?${params}`);
  },
  criarMedicao: (dados: MedicaoEntrada) =>
    requisicao<Medicao>("/medicoes", { method: "POST", body: json(dados) }),
  atualizarMedicao: (id: number, dados: MedicaoEntrada) =>
    requisicao<Medicao>(`/medicoes/${id}`, { method: "PUT", body: json(dados) }),
  excluirMedicao: (id: number) => requisicao<void>(`/medicoes/${id}`, { method: "DELETE" }),

  estatisticas: (dias: number) => requisicao<Estatisticas>(`/estatisticas?dias=${dias}`),
  urlCsv: (dias: number | null) => `/api/exportar/csv${dias ? `?dias=${dias}` : ""}`,

  trocarSenha: (senhaAtual: string, senhaNova: string) =>
    requisicao<void>("/conta/trocar-senha", {
      method: "POST",
      body: json({ senha_atual: senhaAtual, senha_nova: senhaNova }),
    }),
  apagarDados: () => requisicao<void>("/conta/dados", { method: "DELETE" }),
};
