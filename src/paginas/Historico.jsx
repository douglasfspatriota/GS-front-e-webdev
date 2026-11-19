import { useState } from 'react';
import { Plus } from 'lucide-react';
import TituloPagina from '../componentes/TituloPagina.jsx';
import FormularioConta from '../componentes/FormularioConta.jsx';
import TabelaContas from '../componentes/TabelaContas.jsx';
import DialogoConfirmacao from '../componentes/DialogoConfirmacao.jsx';
import Aviso from '../componentes/Aviso.jsx';
import Botao from '../componentes/Botao.jsx';
import { useDados } from '../contexto/DadosContexto.jsx';
import { formatarMes } from '../regras/formatos.js';

export default function Historico() {
  const { contas } = useDados();
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState(null);
  const [aExcluir, setAExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  function abrirNova() {
    setEmEdicao(null);
    setFormularioAberto(true);
    setMensagem(null);
  }

  function abrirEdicao(conta) {
    setEmEdicao(conta);
    setFormularioAberto(true);
    setMensagem(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function fechar() {
    setFormularioAberto(false);
    setEmEdicao(null);
  }

  async function salvar(dados) {
    if (emEdicao) {
      await contas.atualizar(emEdicao.id, dados);
      setMensagem({ tipo: 'sucesso', texto: `Conta de ${formatarMes(dados.mes)} atualizada.` });
      fechar();
    } else {
      await contas.criar(dados);
      setMensagem({ tipo: 'sucesso', texto: `Conta de ${formatarMes(dados.mes)} cadastrada.` });
    }
  }

  async function confirmarExclusao() {
    setExcluindo(true);
    try {
      await contas.excluir(aExcluir.id);
      setMensagem({ tipo: 'sucesso', texto: `Conta de ${formatarMes(aExcluir.mes)} excluída.` });
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    } finally {
      setExcluindo(false);
      setAExcluir(null);
    }
  }

  return (
    <div className="space-y-6">
      <TituloPagina
        titulo="Histórico"
        descricao="Cadastre as contas dos últimos meses. São necessárias pelo menos 4 contas: a mais recente e 3 anteriores como referência."
        acoes={!formularioAberto && <Botao icone={Plus} onClick={abrirNova}>Nova conta</Botao>}
      />

      {mensagem && <Aviso tipo={mensagem.tipo} titulo={mensagem.texto} />}
      {contas.erro && <Aviso tipo="erro" titulo="Não foi possível carregar as contas">{contas.erro}</Aviso>}

      {formularioAberto && (
        <FormularioConta
          conta={emEdicao}
          contasExistentes={contas.contas}
          onSalvar={salvar}
          onCancelar={fechar}
        />
      )}

      {contas.carregando ? (
        <p className="text-slate-600">Carregando contas…</p>
      ) : (
        <TabelaContas contas={contas.historico} onEditar={abrirEdicao} onExcluir={setAExcluir} />
      )}

      <DialogoConfirmacao
        aberto={Boolean(aExcluir)}
        titulo="Excluir conta?"
        textoConfirmar="Excluir"
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setAExcluir(null)}
      >
        {aExcluir && <p>A conta de {formatarMes(aExcluir.mes)} será apagada e a análise será recalculada.</p>}
      </DialogoConfirmacao>
    </div>
  );
}
