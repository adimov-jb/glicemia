import type { ReactNode } from "react";

export default function Cartao({ titulo, children }: { titulo?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      {titulo && <h2 className="mb-3 text-base font-semibold">{titulo}</h2>}
      {children}
    </section>
  );
}
