import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { mensagemDeErro } from "../api/cliente";
import { useAuth } from "../contexto/Auth";

export default function Login() {
  const { usuario, entrar } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to="/" replace />;

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      await entrar(email, senha);
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setEnviando(false);
    }
  }

  const campo =
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none";

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={enviar}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-center text-2xl font-semibold text-emerald-700">Glicemia</h1>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">E-mail</span>
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={campo}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Senha</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className={campo}
          />
        </label>
        {erro && (
          <p role="alert" className="text-sm text-red-700">
            {erro}
          </p>
        )}
        <button
          type="submit"
          disabled={enviando}
          className="min-h-11 w-full rounded-lg bg-emerald-600 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {enviando ? "Entrando…" : "Entrar"}
        </button>
        <p className="text-center text-xs text-slate-500">
          Este aplicativo não substitui orientação médica.
        </p>
      </form>
    </div>
  );
}
