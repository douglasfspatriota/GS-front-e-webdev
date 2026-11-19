// Cartão de uma verificação: hipótese, sinais marcados, desfecho editável e evolução.
import { useEffect, useState } from 'react';
import { Save, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import Botao from './Botao.jsx';
import { DESFECHOS, TAMANHO_MAXIMO_ANOTACAO } from '../regras/verificacao.js';
import { PERGUNTAS } from '../regras/investigacao.js';
import { formatarLitros, formatarMes, formatarPercentual } from '../regras/formatos.js';

const CORES_DESFECHO = {
  pendente: 'bg-slate-100 text-slate-800',
  explicado: 'bg-emerald-100 text-emerald-900',
  reparado: 'bg-agua-100 text-agua-900',
  sem_causa: 'bg-amber-100 text-amber-950',
};

function formatarData(texto) {
  const data = new Date(`${texto.replace(' ', 'T')}Z`);
  return Number.isNaN(data.getTime()) ? texto : data.toLocaleDateString('pt-BR');
}

export default function CartaoVerificacao({ verificacao, evolucao, onSalvar, onExcluir }) {
  const [desfecho, setDesfecho] = useState(verificacao.desfecho);
  const [anotacao, setAnotacao] = useState(verificacao.anotacao);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  // Se a verificação mudar por fora (recarga), atualiza o formulário.
  useEffect(() => {
    setDesfecho(verificacao.desfecho);
    setAnotacao(verificacao.anotacao);
  }, [verificacao]);

  const alterado = desfecho !== verificacao.desfecho || anotacao !== verificacao.anotacao;
  const sinaisMarcados = PERGUNTAS.filter((p) => verificacao.respostas?.[p.id] === 'sim');
  const idBase = `verificacao-${verificacao.id}`;

  async function salvar(evento) {
    evento.preventDefault();
    setSalvando(true);
    setMensagem(null);
    try {
      await onSalvar(verificacao.id, { desfecho, anotacao });
      setMensagem({ tipo: 'ok', texto: 'Desfecho salvo.' });
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <article aria-labelledby={`${idBase}-titulo`} className="space-y-4 rounded-2xl border border-agua-100 bg-white p-5 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm text-slate-600">
            Conta de {formatarMes(verificacao.conta_mes)} · registrada em {formatarData(verificacao.criado_em)}
          </p>
          <h2 id={`${idBase}-titulo`} className="text-xl font-bold text-agua-900">
            {verificacao.hipotese || 'Verificação'}
          </h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-bold ${CORES_DESFECHO[verificacao.desfecho]}`}>
          {DESFECHOS[verificacao.desfecho]}
        </span>
      </header>

      {sinaisMarcados.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-800">Respondeu “sim” para</h3>
          <ul className="mt-1 list-disc space-y-1 pl-6 text-sm text-slate-700">
            {sinaisMarcados.map((p) => <li key={p.id}>{p.texto}</li>)}
          </ul>
        </div>
      )}

      <form onSubmit={salvar} className="grid gap-3 sm:grid-cols-[14rem_1fr]">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${idBase}-desfecho`} className="font-semibold">Desfecho</label>
          <select
            id={`${idBase}-desfecho`}
            value={desfecho}
            onChange={(e) => setDesfecho(e.target.value)}
            className="min-h-11 rounded-lg border border-slate-300 bg-white px-3"
          >
            {Object.entries(DESFECHOS).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`${idBase}-anotacao`} className="font-semibold">O que você verificou</label>
          <textarea
            id={`${idBase}-anotacao`}
            value={anotacao}
            maxLength={TAMANHO_MAXIMO_ANOTACAO}
            rows={2}
            placeholder="Ex.: troquei a boia da caixa-d’água; o hidrômetro parou de girar."
            onChange={(e) => setAnotacao(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
          <Botao type="submit" icone={Save} carregando={salvando} disabled={!alterado}>Salvar desfecho</Botao>
          <Botao variante="fantasma" icone={Trash2} onClick={() => onExcluir(verificacao)} className="text-red-700">
            Excluir
          </Botao>
          {mensagem && (
            <span role="status" className={`text-sm font-semibold ${mensagem.tipo === 'ok' ? 'text-emerald-700' : 'text-red-700'}`}>
              {mensagem.texto}
            </span>
          )}
        </div>
      </form>

      <div className="rounded-xl bg-agua-50 p-4">
        <h3 className="font-bold text-agua-900">Evolução nas contas seguintes</h3>
        {!evolucao.base ? (
          <p className="text-sm text-slate-700">A conta analisada não está mais no histórico.</p>
        ) : evolucao.seguintes.length === 0 ? (
          <p className="text-sm text-slate-700">
            Na conta analisada foram {formatarLitros(evolucao.base.litros)} por pessoa por dia. Cadastre as próximas
            contas para acompanhar se o consumo voltou ao normal.
          </p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {evolucao.seguintes.map((s) => {
              const Icone = s.variacao <= 0 ? TrendingDown : TrendingUp;
              return (
                <li key={s.mes} className="flex flex-wrap items-center gap-2">
                  <Icone aria-hidden="true" className={`size-4 ${s.variacao <= 0 ? 'text-emerald-700' : 'text-red-700'}`} />
                  <strong>{formatarMes(s.mes)}:</strong> {formatarLitros(s.litros)} por pessoa/dia
                  <span className="font-mono">({formatarPercentual(s.variacao)} em relação a {formatarMes(evolucao.base.mes)})</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </article>
  );
}
