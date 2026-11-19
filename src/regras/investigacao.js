// Regras do questionário de investigação: perguntas, hipótese e próximos passos.
// A hipótese não é diagnóstico: só orienta o que conferir primeiro.

export const RESPOSTAS = { sim: 'Sim', nao: 'Não', nao_sei: 'Não sei' };

export const PERGUNTAS = [
  {
    id: 'visitas',
    tipo: 'uso',
    texto: 'Recebeu visitas ou mais pessoas ficaram na casa durante o período?',
  },
  {
    id: 'obras',
    tipo: 'uso',
    texto: 'Houve obra, reforma, lavagem de quintal ou enchimento de piscina?',
  },
  {
    id: 'rotina',
    tipo: 'uso',
    texto: 'A rotina mudou? Por exemplo: mais banhos, mais roupa lavada, alguém passou a trabalhar em casa.',
  },
  {
    id: 'umidade',
    tipo: 'sinal',
    texto: 'Apareceram manchas de umidade, mofo ou piso úmido em paredes, teto ou chão?',
  },
  {
    id: 'ruido',
    tipo: 'sinal',
    texto: 'Ouve barulho de água correndo quando ninguém está usando torneiras ou chuveiro?',
  },
  {
    id: 'descarga',
    tipo: 'sinal',
    texto: 'A água fica escorrendo no vaso sanitário depois da descarga, ou a caixa-d’água transborda pelo ladrão?',
  },
  {
    id: 'hidrometro',
    tipo: 'teste',
    texto: 'Com todas as torneiras fechadas e ninguém usando água, o hidrômetro continuou girando?',
    ajuda: 'Feche tudo, anote o número do hidrômetro e confira de novo depois de 30 a 60 minutos. Lembre que a caixa-d’água pode estar enchendo.',
  },
];

export const HIPOTESES = {
  vazamento_provavel: 'Indício forte de vazamento',
  possivel_vazamento: 'Possível vazamento ou desperdício',
  uso_explicado: 'Aumento provavelmente explicado pelo uso',
  misto: 'Uso maior e sinais de vazamento ao mesmo tempo',
  indefinido: 'Causa ainda não identificada',
};

export function questionarioCompleto(respostas) {
  return PERGUNTAS.every((p) => Object.hasOwn(RESPOSTAS, respostas[p.id]));
}

export function avaliarRespostas(respostas) {
  const marcadas = (tipo) => PERGUNTAS.filter((p) => p.tipo === tipo && respostas[p.id] === 'sim').map((p) => p.id);
  const usos = marcadas('uso');
  const sinais = marcadas('sinal');
  const hidrometroGirou = respostas.hidrometro === 'sim';

  let tipo;
  if (hidrometroGirou) tipo = 'vazamento_provavel';
  else if (sinais.length > 0 && usos.length > 0) tipo = 'misto';
  else if (sinais.length > 0) tipo = 'possivel_vazamento';
  else if (usos.length > 0) tipo = 'uso_explicado';
  else tipo = 'indefinido';

  const passos = [];
  if (hidrometroGirou) {
    passos.push('Feche o registro geral: se o hidrômetro parar, o vazamento está depois dele, dentro da casa.');
    passos.push('Chame um encanador ou peça uma vistoria à concessionária para localizar o vazamento.');
  }
  if (respostas.hidrometro !== 'sim' && respostas.hidrometro !== 'nao') {
    passos.push('Faça o teste do hidrômetro com tudo fechado por 30 a 60 minutos. É o teste mais simples para confirmar vazamento.');
  }
  if (sinais.includes('descarga')) {
    passos.push('Confira a válvula ou a boia da descarga e a boia da caixa-d’água. São causas comuns de desperdício contínuo.');
  }
  if (sinais.includes('umidade')) {
    passos.push('Anote onde estão as manchas: elas ajudam o profissional a localizar canos com vazamento na parede ou no piso.');
  }
  if (sinais.includes('ruido')) {
    passos.push('Tente identificar de onde vem o barulho, fechando os registros de cada ambiente um de cada vez.');
  }
  if (usos.length > 0) {
    passos.push('Compare com a próxima conta: se o uso voltar ao normal, o consumo deve cair junto.');
  }
  if (tipo === 'indefinido') {
    passos.push('Confira na conta se a leitura foi real ou estimada e se houve reajuste de tarifa.');
    passos.push('Se a dúvida continuar, peça à concessionária a revisão da leitura.');
  }
  passos.push('Registre o que você verificou para acompanhar a evolução nas próximas contas.');

  return { tipo, titulo: HIPOTESES[tipo], usos, sinais, passos };
}
