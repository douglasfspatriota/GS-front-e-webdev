// Camada de acesso aos dados: o único lugar da interface que faz chamadas HTTP.
import { obterCasaId } from './casa.js';

const BASE = import.meta.env?.VITE_API_URL ?? '/api';

export class ErroApi extends Error {
  constructor(mensagem, status, erros = {}) {
    super(mensagem);
    this.name = 'ErroApi';
    this.status = status;
    this.erros = erros; // erros por campo, vindos da validação do servidor
  }
}

async function requisitar(caminho, { metodo = 'GET', corpo } = {}) {
  let resposta;
  try {
    resposta = await fetch(`${BASE}${caminho}`, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        'X-Casa-Id': obterCasaId(),
      },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  } catch {
    throw new ErroApi('Não foi possível falar com o servidor. Verifique sua conexão.', 0);
  }

  if (resposta.status === 204) return null;

  let dados = null;
  try {
    dados = await resposta.json();
  } catch {
    /* resposta sem JSON */
  }

  if (!resposta.ok) {
    throw new ErroApi(dados?.erro ?? `Erro ${resposta.status} no servidor.`, resposta.status, dados?.erros);
  }
  return dados;
}

export const apiContas = {
  listar: () => requisitar('/contas'),
  buscar: (id) => requisitar(`/contas/${id}`),
  criar: (conta) => requisitar('/contas', { metodo: 'POST', corpo: conta }),
  atualizar: (id, conta) => requisitar(`/contas/${id}`, { metodo: 'PUT', corpo: conta }),
  excluir: (id) => requisitar(`/contas/${id}`, { metodo: 'DELETE' }),
};

export const apiVerificacoes = {
  listar: () => requisitar('/verificacoes'),
  criar: (verificacao) => requisitar('/verificacoes', { metodo: 'POST', corpo: verificacao }),
  atualizar: (id, alteracao) => requisitar(`/verificacoes/${id}`, { metodo: 'PUT', corpo: alteracao }),
  excluir: (id) => requisitar(`/verificacoes/${id}`, { metodo: 'DELETE' }),
};
