import { useContas } from './hooks/useContas.js';
import { formatarLitros, formatarMes } from './regras/formatos.js';

// Tela provisória para conferir a ligação com a API (será substituída pelas páginas).
export default function App() {
  const { historico, carregando, erro, analise } = useContas();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 px-4 py-12">
      <h1 className="text-4xl font-bold text-agua-900">Gota Alerta</h1>
      {carregando && <p>Carregando contas…</p>}
      {erro && <p role="alert" className="text-red-700">{erro}</p>}
      {!carregando && !erro && (
        <>
          <p className="text-slate-700">
            {historico.length} conta(s) cadastrada(s). Nível atual: <strong>{analise.nivel}</strong>
          </p>
          <ul className="list-disc pl-6">
            {historico.map((c) => (
              <li key={c.id}>
                {formatarMes(c.mes)}: {formatarLitros(c.litrosPessoaDia)} por pessoa por dia
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
