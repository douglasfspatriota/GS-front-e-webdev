// Questionário de investigação: uma pergunta por grupo de opções (Sim / Não / Não sei).
import { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import Botao from './Botao.jsx';
import Aviso from './Aviso.jsx';
import { PERGUNTAS, RESPOSTAS, questionarioCompleto } from '../regras/investigacao.js';

export default function Questionario({ onConcluir }) {
  const [respostas, setRespostas] = useState({});
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const respondidas = PERGUNTAS.filter((p) => respostas[p.id]).length;

  function enviar(evento) {
    evento.preventDefault();
    setTentouEnviar(true);
    if (questionarioCompleto(respostas)) onConcluir(respostas);
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-5">
      <div>
        <div className="mb-1 flex justify-between text-sm text-slate-700">
          <span>Progresso</span>
          <span>{respondidas} de {PERGUNTAS.length} respondidas</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-agua-100" aria-hidden="true">
          <div className="h-full bg-agua-700 transition-all" style={{ width: `${(respondidas / PERGUNTAS.length) * 100}%` }} />
        </div>
      </div>

      <ol className="space-y-4">
        {PERGUNTAS.map((p, i) => {
          const faltando = tentouEnviar && !respostas[p.id];
          return (
            <li key={p.id}>
              <fieldset
                className={`rounded-2xl border bg-white p-4 shadow-sm ${faltando ? 'border-red-500' : 'border-agua-100'}`}
                aria-describedby={p.ajuda ? `ajuda-${p.id}` : undefined}
              >
                <legend className="float-left w-full font-semibold text-slate-900">
                  <span className="mr-2 font-mono text-agua-700">{i + 1}.</span>
                  {p.texto}
                </legend>
                {p.ajuda && <p id={`ajuda-${p.id}`} className="mt-1 text-sm text-slate-600">{p.ajuda}</p>}
                <div className="clear-both flex flex-wrap gap-2 pt-3">
                  {Object.entries(RESPOSTAS).map(([valor, rotulo]) => (
                    <label
                      key={valor}
                      className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 has-checked:border-agua-700 has-checked:bg-agua-50 has-checked:font-bold has-focus-visible:outline-3 has-focus-visible:outline-agua-600"
                    >
                      <input
                        type="radio"
                        name={p.id}
                        value={valor}
                        checked={respostas[p.id] === valor}
                        onChange={() => setRespostas((r) => ({ ...r, [p.id]: valor }))}
                        className="size-4 accent-agua-700"
                      />
                      {rotulo}
                    </label>
                  ))}
                </div>
                {faltando && <p className="mt-2 text-sm font-semibold text-red-700">Escolha uma resposta.</p>}
              </fieldset>
            </li>
          );
        })}
      </ol>

      {tentouEnviar && !questionarioCompleto(respostas) && (
        <Aviso tipo="erro" titulo="Responda todas as perguntas">Se não souber, escolha “Não sei”.</Aviso>
      )}
      <Botao type="submit" icone={ClipboardCheck}>Ver hipótese e próximos passos</Botao>
    </form>
  );
}
