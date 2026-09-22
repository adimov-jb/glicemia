import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import Layout from "./componentes/Layout";
import { ProvedorAuth, useAuth } from "./contexto/Auth";
import Conta from "./paginas/Conta";
import Historico from "./paginas/Historico";
import Login from "./paginas/Login";
import Painel from "./paginas/Painel";

function RotaProtegida() {
  const { usuario, carregando } = useAuth();
  if (carregando) return <p className="p-8 text-center text-slate-500">Carregando…</p>;
  return usuario ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ProvedorAuth>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RotaProtegida />}>
            <Route element={<Layout />}>
              <Route index element={<Painel />} />
              <Route path="historico" element={<Historico />} />
              <Route path="conta" element={<Conta />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ProvedorAuth>
    </BrowserRouter>
  );
}
