import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import TituloPagina from '../componentes/TituloPagina.jsx';
import CartaoVerificacao from '../componentes/CartaoVerificacao.jsx';
import DialogoConfirmacao from '../componentes/DialogoConfirmacao.jsx';
import Aviso from '../componentes/Aviso.jsx';
import { useDados } from '../contexto/DadosContexto.jsx';
import { evolucaoAposMes } from '../regras/consumo.js';
import { DESFECHOS } from '../regras/verificacao.js';
import { formatarMes } from '../regras/formatos.js';

export default function Verificacoes() {
  const { contas, verificacoes } = useDados();
  const local = useLocation();
  const [aExcluir, setAExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState(null);
  const lista = verificacoes.verificacoes;

  async function confirmarExclusao() {
    setExcluindo(true);
    try {
      await verificacoes.excluir(aExcluir.id);
    } catch (e) {
      setErro(e.message);
    } finally {
      setExcluindo(false);
      setAExcluir(null);
    }
  }

  // Resumo: quantas verificações terminaram com desfecho registrado.
  const concluidas = lista.filter((v) => v.desfecho !== 'pendente').length;

  return (
    <div className="space-y-6">
      <TituloPagina
        titulo="Verificações"
        descricao="O que você conferiu depois de cada alerta e como o consumo evoluiu nas contas seguintes."
      />

      {local.state?.registrada && (
        <Aviso tipo="sucesso" titulo="Verificação registrada">
          Atualize o desfecho quando descobrir a causa ou fizer um reparo.
        </Aviso>
      )}
      {(erro || verificacoes.erro) && <Aviso tipo="erro" titulo="Algo deu errado">{erro || verificacoes.erro}</Aviso>}

      {verificacoes.carregando ? (
        <p className="text-slate-600">Carregando verificações…</p>
      ) : lista.length === 0 ? (
        <Aviso
          tipo="info"
          titulo="Nenhuma verificação registrada"
          acao={<Link to="/investigar" className="font-semibold underline">Responder o questionário de investigação</Link>}
        >
          Quando um aumento aparecer, responda o questionário e registre o que você conferiu.
        </Aviso>
      ) : (
        <>
          <p className="text-slate-700">
            {concluidas} de {lista.length} verificação(ões) com desfecho registrado.
          </p>
          <div className="space-y-4">
            {lista.map((v) => (
              <CartaoVerificacao
                key={v.id}
                verificacao={v}
                evolucao={evolucaoAposMes(contas.contas, v.conta_mes)}
                onSalvar={verificacoes.atualizar}
                onExcluir={setAExcluir}
              />
            ))}
          </div>
        </>
      )}

      <DialogoConfirmacao
        aberto={Boolean(aExcluir)}
        titulo="Excluir verificação?"
        textoConfirmar="Excluir"
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setAExcluir(null)}
      >
        {aExcluir && (
          <p>
            A verificação da conta de {formatarMes(aExcluir.conta_mes)} ({DESFECHOS[aExcluir.desfecho].toLowerCase()})
            será apagada.
          </p>
        )}
      </DialogoConfirmacao>
    </div>
  );
}
