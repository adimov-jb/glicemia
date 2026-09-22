interface Props<T extends number | null> {
  opcoes: readonly T[];
  valor: T;
  aoMudar: (valor: T) => void;
}

export default function SeletorPeriodo<T extends number | null>({ opcoes, valor, aoMudar }: Props<T>) {
  return (
    <div role="group" aria-label="Período" className="inline-flex rounded-lg bg-slate-100 p-1">
      {opcoes.map((opcao) => (
        <button
          key={opcao ?? "tudo"}
          type="button"
          aria-pressed={opcao === valor}
          onClick={() => aoMudar(opcao)}
          className={`min-w-11 rounded-md px-3 py-1.5 text-sm font-medium ${
            opcao === valor ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
          }`}
        >
          {opcao === null ? "Tudo" : `${opcao}d`}
        </button>
      ))}
    </div>
  );
}
