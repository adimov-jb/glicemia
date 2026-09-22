import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexto/Auth";

const LINKS = [
  { para: "/", rotulo: "Painel" },
  { para: "/historico", rotulo: "Histórico" },
  { para: "/conta", rotulo: "Conta" },
];

export default function Layout() {
  const { sair } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
          <span className="text-lg font-semibold text-emerald-700">Glicemia</span>
          <nav className="order-last flex w-full gap-1 sm:order-none sm:w-auto">
            {LINKS.map((link) => (
              <NavLink
                key={link.para}
                to={link.para}
                end
                className={({ isActive }) =>
                  `flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium sm:flex-none ${
                    isActive ? "bg-emerald-50 text-emerald-800" : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                {link.rotulo}
              </NavLink>
            ))}
          </nav>
          <button onClick={() => void sair()} className="text-sm text-slate-500 hover:text-slate-800">
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="px-4 py-6 text-center text-xs text-slate-500">
        Este aplicativo não substitui orientação médica.
      </footer>
    </div>
  );
}
