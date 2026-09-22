import { useState, type FormEvent } from "react";
import { api, mensagemDeErro } from "../api/cliente";
import Cartao from "../componentes/Cartao";
import { useAuth } from "../contexto/Auth";

export default function Conta() {
  const { usuario } = useAuth();
  const [senhaAtual, setSenhaAtual] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [aviso, setAviso] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  async function trocarSenha(evento: FormEvent) {
    evento.preventDefault();
    try {
      await api.trocarSenha(senhaAtual, senhaNova);
      setSenhaAtual("");
      setSenhaNova("");
      setAviso({ tipo: "ok", texto: "Senha alterada." });
    } catch (e) {
      setAviso({ tipo: "erro", texto: mensagemDeErro(e) });
    }
  }

  async function apagarDados() {
    if (!window.confirm("Apagar TODAS as medições? Esta ação não pode ser desfeita.")) return;
    try {
      await api.apagarDados();
      setAviso({ tipo: "ok", texto: "Todas as medições foram apagadas." });
    } catch (e) {
      setAviso({ tipo: "erro", texto: mensagemDeErro(e) });
    }
  }

  const campo =
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none";

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-xl font-semibold">Conta</h1>
      <p className="text-sm text-slate-600">{usuario?.email}</p>

      {aviso && (
        <p
          role="status"
          className={`rounded-lg p-3 text-sm ${aviso.tipo === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}
        >
          {aviso.texto}
        </p>
      )}

      <Cartao titulo="Trocar senha">
        <form onSubmit={trocarSenha} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Senha atual</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              className={campo}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Nova senha (mín. 8)</span>
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={senhaNova}
              onChange={(e) => setSenhaNova(e.target.value)}
              className={campo}
            />
          </label>
          <button
            type="submit"
            className="min-h-11 rounded-lg bg-emerald-600 px-5 font-medium text-white hover:bg-emerald-700"
          >
            Alterar senha
          </button>
        </form>
      </Cartao>

      <Cartao titulo="Seus dados">
        <p className="mb-3 text-sm text-slate-600">
          Apaga permanentemente todas as medições registradas.
        </p>
        <button
          onClick={() => void apagarDados()}
          className="min-h-11 rounded-lg border border-red-300 px-5 font-medium text-red-700 hover:bg-red-50"
        >
          Apagar todos os dados
        </button>
      </Cartao>
    </div>
  );
}
