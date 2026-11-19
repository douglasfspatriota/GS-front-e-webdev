// Hook personalizado: CRUD das verificações registradas pelo morador.
import { useCallback, useEffect, useState } from 'react';
import { apiVerificacoes } from '../servicos/api.js';

export function useVerificacoes() {
  const [verificacoes, setVerificacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setVerificacoes(await apiVerificacoes.listar());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const registrar = useCallback(async (dados) => {
    const nova = await apiVerificacoes.criar(dados);
    setVerificacoes((atuais) => [nova, ...atuais]);
    return nova;
  }, []);

  const atualizar = useCallback(async (id, alteracao) => {
    const atualizada = await apiVerificacoes.atualizar(id, alteracao);
    setVerificacoes((atuais) => atuais.map((v) => (v.id === id ? atualizada : v)));
    return atualizada;
  }, []);

  const excluir = useCallback(async (id) => {
    await apiVerificacoes.excluir(id);
    setVerificacoes((atuais) => atuais.filter((v) => v.id !== id));
  }, []);

  return { verificacoes, carregando, erro, recarregar, registrar, atualizar, excluir };
}
