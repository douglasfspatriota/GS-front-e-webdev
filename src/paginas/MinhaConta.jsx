import { useState } from 'react';
import { Link } from 'react-router';
import { Database, Plus, Search } from 'lucide-react';
import TituloPagina from '../componentes/TituloPagina.jsx';
import VisorHidrometro from '../componentes/VisorHidrometro.jsx';
import SeloNivel from '../componentes/SeloNivel.jsx';
import ExplicacaoAnalise from '../componentes/ExplicacaoAnalise.jsx';
import Aviso from '../componentes/Aviso.jsx';
import Botao from '../componentes/Botao.jsx';
import { useDados } from '../contexto/DadosContexto.jsx';
import { NIVEIS, litrosPorPessoaDia } from '../regras/consumo.js';
import { formatarMes } from '../regras/formatos.js';

const classeLinkBotao =
  'inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 font-semibold';

export default function MinhaConta() {
  const { contas } = useDados();
  const { analise, carregando, erro } = contas;
  const [carregandoDemo, setCarregandoDemo] = useState(false);
  const [erroDemo, setErroDemo] = useState(null);

  async function verDemonstracao() {
    setCarregandoDemo(true);
    setErroDemo(null);
    try {
      await contas.carregarDemonstracao();
    } catch (e) {
      setErroDemo(e.message);
    } finally {
      setCarregandoDemo(false);
    }
  }

  if (carregando) return <p className="text-slate-600">Carregando sua conta…</p>;
  if (erro) return <Aviso tipo="erro" titulo="Não foi possível carregar as contas">{erro}</Aviso>;

  // Nenhuma conta: convite para começar.
  if (contas.contas.length === 0) {
    return (
      <div className="space-y-6">
        <TituloPagina
          titulo="Entenda a sua conta de água"
          descricao="Cadastre as contas dos últimos meses. O Gota Alerta compara o consumo por pessoa com o histórico da sua casa, explica aumentos e ajuda a investigar possíveis desperdícios."
        />
        {erroDemo && <Aviso tipo="erro" titulo="Não foi possível carregar a demonstração">{erroDemo}</Aviso>}
        <div className="flex flex-wrap gap-3">
          <Link to="/historico" className={`${classeLinkBotao} bg-agua-700 text-white hover:bg-agua-800`}>
            <Plus aria-hidden="true" className="size-5" /> Cadastrar minhas contas
          </Link>
          <Botao variante="secundario" icone={Database} onClick={verDemonstracao} carregando={carregandoDemo}>
            Ver com dados de demonstração
          </Botao>
        </div>
        <p className="text-sm text-slate-600">Os dados de demonstração são fictícios.</p>
      </div>
    );
  }

  const { atual } = analise;
  const consumoAtual = litrosPorPessoaDia(atual);
  const precisaInvestigar = analise.nivel === NIVEIS.ATENCAO || analise.nivel === NIVEIS.INVESTIGAR;

  return (
    <div className="space-y-6">
      <TituloPagina
        titulo="Minha conta"
        descricao={`Conta mais recente: ${formatarMes(atual.mes)}. Comparação com até 6 contas anteriores da sua casa.`}
      />

      <div className="flex flex-col items-center gap-6 rounded-2xl border border-agua-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-around">
        <VisorHidrometro
          valor={consumoAtual}
          unidade="L"
          legenda={`por pessoa por dia em ${formatarMes(atual.mes)}`}
        />
        <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
          <SeloNivel nivel={analise.nivel} tamanho="grande" />
          {precisaInvestigar && (
            <Link to="/investigar" className={`${classeLinkBotao} bg-agua-700 text-white hover:bg-agua-800`}>
              <Search aria-hidden="true" className="size-5" /> Investigar este aumento
            </Link>
          )}
        </div>
      </div>

      {analise.nivel === NIVEIS.SEM_REFERENCIA ? (
        <Aviso
          tipo="info"
          titulo={`Faltam ${analise.faltam} conta(s) para comparar`}
          acao={<Link to="/historico" className="font-semibold underline">Cadastrar contas anteriores</Link>}
        >
          A comparação usa a média de pelo menos 3 contas anteriores à mais recente.
        </Aviso>
      ) : (
        <ExplicacaoAnalise analise={analise} />
      )}
    </div>
  );
}
