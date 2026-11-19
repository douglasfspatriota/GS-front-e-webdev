// Hook personalizado: carrega as contas da API, oferece o CRUD
// e entrega a análise e o histórico já calculados para as telas.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiContas } from '../servicos/api.js';
import { CONTAS_DEMONSTRACAO } from '../dados/demonstracao.js';
import { analisarConsumo, montarHistorico, ordenarPorMes } from '../regras/consumo.js';

export function useContas() {
  const [contas, setContas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setContas(await apiContas.listar());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  // As funções de escrita devolvem o resultado ou lançam ErroApi,
  // para o formulário mostrar os erros de cada campo.
  const criar = useCallback(async (dados) => {
    const nova = await apiContas.criar(dados);
    setContas((atuais) => ordenarPorMes([...atuais, nova]));
    return nova;
  }, []);

  const atualizar = useCallback(async (id, dados) => {
    const atualizada = await apiContas.atualizar(id, dados);
    setContas((atuais) => ordenarPorMes(atuais.map((c) => (c.id === id ? atualizada : c))));
    return atualizada;
  }, []);

  const excluir = useCallback(async (id) => {
    await apiContas.excluir(id);
    setContas((atuais) => atuais.filter((c) => c.id !== id));
  }, []);

  // Cadastra as contas fictícias de demonstração (pula meses já cadastrados).
  const carregarDemonstracao = useCallback(async () => {
    const existentes = new Set((await apiContas.listar()).map((c) => c.mes));
    for (const conta of CONTAS_DEMONSTRACAO) {
      if (!existentes.has(conta.mes)) await apiContas.criar(conta);
    }
    await recarregar();
  }, [recarregar]);

  const analise = useMemo(() => analisarConsumo(contas), [contas]);
  const historico = useMemo(() => montarHistorico(contas), [contas]);

  return { contas, carregando, erro, recarregar, criar, atualizar, excluir, carregarDemonstracao, analise, historico };
}
