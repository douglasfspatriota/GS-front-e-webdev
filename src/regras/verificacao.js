// Regras da verificação: o registro do que o morador conferiu depois de um alerta.

export const DESFECHOS = {
  pendente: 'Ainda investigando',
  explicado: 'Consumo explicado',
  reparado: 'Reparo realizado',
  sem_causa: 'Causa não encontrada',
};

export const TAMANHO_MAXIMO_ANOTACAO = 1000;
const FORMATO_MES = /^\d{4}-(0[1-9]|1[0-2])$/;

function validarDesfechoEAnotacao(dados, erros) {
  const desfecho = dados.desfecho ?? 'pendente';
  const anotacao = String(dados.anotacao ?? '').trim();
  if (!Object.hasOwn(DESFECHOS, desfecho)) erros.desfecho = 'Escolha um desfecho da lista.';
  if (anotacao.length > TAMANHO_MAXIMO_ANOTACAO) {
    erros.anotacao = `A anotação pode ter até ${TAMANHO_MAXIMO_ANOTACAO} caracteres.`;
  }
  return { desfecho, anotacao };
}

// Nova verificação: mês da conta analisada, respostas do questionário, hipótese e desfecho.
export function validarVerificacao(dados = {}) {
  const erros = {};
  const conta_mes = String(dados.conta_mes ?? '').trim();
  const respostas = dados.respostas ?? {};
  const hipotese = String(dados.hipotese ?? '').trim();

  if (!FORMATO_MES.test(conta_mes)) erros.conta_mes = 'Informe o mês da conta analisada (AAAA-MM).';
  if (typeof respostas !== 'object' || Array.isArray(respostas) || respostas === null) {
    erros.respostas = 'As respostas devem ser um objeto.';
  }
  if (hipotese.length > 500) erros.hipotese = 'A hipótese pode ter até 500 caracteres.';
  const { desfecho, anotacao } = validarDesfechoEAnotacao(dados, erros);

  const valido = Object.keys(erros).length === 0;
  return {
    valido,
    erros,
    verificacao: valido ? { conta_mes, respostas, hipotese, desfecho, anotacao } : null,
  };
}

// Atualização: só o desfecho e a anotação mudam depois de registrada.
export function validarAtualizacaoVerificacao(dados = {}) {
  const erros = {};
  const { desfecho, anotacao } = validarDesfechoEAnotacao(dados, erros);
  const valido = Object.keys(erros).length === 0;
  return { valido, erros, alteracao: valido ? { desfecho, anotacao } : null };
}
