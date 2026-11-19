import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { RotateCcw, Save } from 'lucide-react';
import TituloPagina from '../componentes/TituloPagina.jsx';
import Questionario from '../componentes/Questionario.jsx';
import SeloNivel from '../componentes/SeloNivel.jsx';
import Aviso from '../componentes/Aviso.jsx';
import Botao from '../componentes/Botao.jsx';
import { useDados } from '../contexto/DadosContexto.jsx';
import { avaliarRespostas } from '../regras/investigacao.js';
import { formatarMes, formatarPercentual } from '../regras/formatos.js';

export default function Investigar() {
  const { contas, verificacoes } = useDados();
  const navegar = useNavigate();
  const [respostas, setRespostas] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const { analise } = contas;

  if (contas.carregando) return <p className="text-slate-600">Carregando…</p>;

  if (!analise.atual) {
    return (
      <div className="space-y-6">
        <TituloPagina titulo="Investigar aumento" />
        <Aviso tipo="info" titulo="Cadastre suas contas primeiro" acao={<Link to="/historico" className="font-semibold underline">Ir para o histórico</Link>}>
          A investigação parte da conta mais recente da sua casa.
        </Aviso>
      </div>
    );
  }

  const resultado = respostas ? avaliarRespostas(respostas) : null;

  async function registrar() {
    setSalvando(true);
    setErro(null);
    try {
      await verificacoes.registrar({
        conta_mes: analise.atual.mes,
        respostas,
        hipotese: resultado.titulo,
        desfecho: 'pendente',
      });
      navegar('/verificacoes', { state: { registrada: true } });
    } catch (e) {
      setErro(e.message);
      setSalvando(false);
    }
  }

  return (
    <div className="space-y-6">
      <TituloPagina
        titulo="Investigar aumento"
        descricao={`Sobre a conta de ${formatarMes(analise.atual.mes)}. As respostas ajudam a levantar hipóteses; a confirmação depende de inspeção na casa.`}
      />

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-agua-100 bg-white p-4">
        <SeloNivel nivel={analise.nivel} />
        {analise.variacaoConsumo !== undefined && (
          <span className="text-slate-700">
            Variação do consumo por pessoa: <strong className="font-mono">{formatarPercentual(analise.variacaoConsumo)}</strong>
          </span>
        )}
      </div>

      {!resultado ? (
        <Questionario onConcluir={setRespostas} />
      ) : (
        <section aria-labelledby="titulo-hipotese" className="space-y-4 rounded-2xl border border-agua-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-agua-700">Hipótese</p>
          <h2 id="titulo-hipotese" className="text-2xl font-bold text-agua-900">{resultado.titulo}</h2>
          <div>
            <h3 className="mb-2 font-bold text-slate-800">Próximos passos</h3>
            <ol className="list-decimal space-y-2 pl-6 leading-relaxed">
              {resultado.passos.map((passo) => <li key={passo}>{passo}</li>)}
            </ol>
          </div>
          <p className="text-sm text-slate-600">
            Um medidor geral não mostra em qual cômodo está o desperdício. Para localizar um vazamento é preciso
            inspeção ou sensores adicionais.
          </p>
          {erro && <Aviso tipo="erro" titulo="Não foi possível registrar">{erro}</Aviso>}
          <div className="flex flex-wrap gap-2">
            <Botao icone={Save} onClick={registrar} carregando={salvando}>Registrar verificação</Botao>
            <Botao variante="secundario" icone={RotateCcw} onClick={() => setRespostas(null)}>Refazer questionário</Botao>
          </div>
        </section>
      )}
    </div>
  );
}
