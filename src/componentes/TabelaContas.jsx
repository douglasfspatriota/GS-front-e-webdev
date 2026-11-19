// Tabela das contas cadastradas com o consumo normalizado e ações de editar/excluir.
import { Pencil, Trash2 } from 'lucide-react';
import { formatarLitros, formatarMes, formatarNumero, formatarReais } from '../regras/formatos.js';

export default function TabelaContas({ contas, onEditar, onExcluir }) {
  if (contas.length === 0) {
    return <p className="rounded-xl bg-white p-6 text-slate-600">Nenhuma conta cadastrada ainda.</p>;
  }

  // Mais recente primeiro.
  const linhas = [...contas].reverse();

  return (
    <div className="overflow-x-auto rounded-2xl border border-agua-100 bg-white shadow-sm">
      <table className="w-full min-w-[640px] text-left">
        <caption className="sr-only">Contas de água cadastradas, da mais recente para a mais antiga</caption>
        <thead className="bg-agua-50 text-sm text-agua-900">
          <tr>
            <th scope="col" className="px-4 py-3">Mês</th>
            <th scope="col" className="px-4 py-3 text-right">Volume</th>
            <th scope="col" className="px-4 py-3 text-right">Valor</th>
            <th scope="col" className="px-4 py-3 text-right">Dias</th>
            <th scope="col" className="px-4 py-3 text-right">Moradores</th>
            <th scope="col" className="px-4 py-3 text-right">Por pessoa/dia</th>
            <th scope="col" className="px-4 py-3"><span className="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {linhas.map((c) => (
            <tr key={c.id}>
              <th scope="row" className="px-4 py-3 font-semibold">{formatarMes(c.mes)}</th>
              <td className="px-4 py-3 text-right font-mono">{formatarNumero(c.volume_m3, 1)} m³</td>
              <td className="px-4 py-3 text-right font-mono">{formatarReais(c.valor_reais)}</td>
              <td className="px-4 py-3 text-right font-mono">{c.dias}</td>
              <td className="px-4 py-3 text-right font-mono">{c.moradores}</td>
              <td className="px-4 py-3 text-right font-mono font-bold">{formatarLitros(c.litrosPessoaDia)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onEditar(c)}
                    className="rounded-lg p-2 text-agua-800 hover:bg-agua-50"
                  >
                    <Pencil aria-hidden="true" className="size-5" />
                    <span className="sr-only">Editar conta de {formatarMes(c.mes)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onExcluir(c)}
                    className="rounded-lg p-2 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 aria-hidden="true" className="size-5" />
                    <span className="sr-only">Excluir conta de {formatarMes(c.mes)}</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
