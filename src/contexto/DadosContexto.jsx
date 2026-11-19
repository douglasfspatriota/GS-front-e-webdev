// Compartilha contas e verificações entre as páginas sem repetir chamadas à API.
import { createContext, useContext } from 'react';
import { useContas } from '../hooks/useContas.js';
import { useVerificacoes } from '../hooks/useVerificacoes.js';

const DadosContexto = createContext(null);

export function ProvedorDados({ children }) {
  const contas = useContas();
  const verificacoes = useVerificacoes();
  return <DadosContexto.Provider value={{ contas, verificacoes }}>{children}</DadosContexto.Provider>;
}

export function useDados() {
  const valor = useContext(DadosContexto);
  if (!valor) throw new Error('useDados precisa estar dentro de <ProvedorDados>.');
  return valor;
}
