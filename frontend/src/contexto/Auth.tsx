import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, definirAoNaoAutenticado } from "../api/cliente";
import type { Usuario } from "../api/tipos";

interface ContextoAuth {
  usuario: Usuario | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
  /** Atualiza os dados do usuário logado (ex.: após trocar o nome). */
  definirUsuario: (usuario: Usuario) => void;
}

const Contexto = createContext<ContextoAuth | null>(null);

export function ProvedorAuth({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    definirAoNaoAutenticado(() => setUsuario(null));
    api
      .eu()
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setCarregando(false));
    return () => definirAoNaoAutenticado(null);
  }, []);

  const entrar = useCallback(async (email: string, senha: string) => {
    setUsuario(await api.login(email, senha));
  }, []);

  const sair = useCallback(async () => {
    await api.logout();
    setUsuario(null);
  }, []);

  return (
    <Contexto.Provider value={{ usuario, carregando, entrar, sair, definirUsuario: setUsuario }}>{children}</Contexto.Provider>
  );
}

export function useAuth(): ContextoAuth {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useAuth precisa estar dentro de <ProvedorAuth>");
  return contexto;
}
