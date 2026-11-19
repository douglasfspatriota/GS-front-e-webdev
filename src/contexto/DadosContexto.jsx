// Compartilha os dados das contas entre as páginas sem repetir chamadas à API.
import { createContext, useContext } from 'react';
import { useContas } from '../hooks/useContas.js';

const DadosContexto = createContext(null);

export function ProvedorDados({ children }) {
  const contas = useContas();
  return <DadosContexto.Provider value={{ contas }}>{children}</DadosContexto.Provider>;
}

export function useDados() {
  const valor = useContext(DadosContexto);
  if (!valor) throw new Error('useDados precisa estar dentro de <ProvedorDados>.');
  return valor;
}
