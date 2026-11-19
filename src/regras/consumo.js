// Regras de negócio do consumo de água.
// Funções puras: não usam React nem fazem chamadas HTTP.

export const LIMITE_ATENCAO = 0.2; // a partir de 20% de aumento
export const LIMITE_INVESTIGAR = 0.5; // a partir de 50% de aumento
export const MINIMO_CONTAS_REFERENCIA = 3;
export const MAXIMO_CONTAS_REFERENCIA = 6;

export const NIVEIS = {
  SEM_REFERENCIA: 'sem_referencia',
  NORMAL: 'normal',
  ATENCAO: 'atencao',
  INVESTIGAR: 'investigar',
};

// Litros por pessoa por dia = volume em m³ × 1.000 ÷ dias ÷ moradores.
export function litrosPorPessoaDia({ volume_m3, dias, moradores }) {
  if (!(dias > 0) || !(moradores > 0)) return 0;
  return (volume_m3 * 1000) / dias / moradores;
}

// Preço médio por m³ (o valor em reais é analisado separadamente do volume).
export function precoPorM3({ valor_reais, volume_m3 }) {
  if (!(volume_m3 > 0)) return 0;
  return valor_reais / volume_m3;
}

export function ordenarPorMes(contas) {
  return [...contas].sort((a, b) => a.mes.localeCompare(b.mes));
}

export function media(valores) {
  if (valores.length === 0) return 0;
  return valores.reduce((soma, v) => soma + v, 0) / valores.length;
}

export function variacao(atual, referencia) {
  if (!(referencia > 0)) return 0;
  return (atual - referencia) / referencia;
}

export function classificarVariacao(v) {
  if (v >= LIMITE_INVESTIGAR) return NIVEIS.INVESTIGAR;
  if (v >= LIMITE_ATENCAO) return NIVEIS.ATENCAO;
  return NIVEIS.NORMAL;
}

// Compara a conta mais recente com até 6 contas anteriores (mínimo de 3).
export function analisarConsumo(contas) {
  const ordenadas = ordenarPorMes(contas);
  const atual = ordenadas.at(-1) ?? null;
  const anteriores = ordenadas.slice(0, -1).slice(-MAXIMO_CONTAS_REFERENCIA);

  if (!atual || anteriores.length < MINIMO_CONTAS_REFERENCIA) {
    return {
      nivel: NIVEIS.SEM_REFERENCIA,
      atual,
      contasReferencia: anteriores,
      faltam: MINIMO_CONTAS_REFERENCIA - anteriores.length + (atual ? 0 : 1),
      motivos: [],
    };
  }

  const consumoAtual = litrosPorPessoaDia(atual);
  const consumoReferencia = media(anteriores.map(litrosPorPessoaDia));
  const variacaoConsumo = variacao(consumoAtual, consumoReferencia);

  const precoAtual = precoPorM3(atual);
  const precoReferencia = media(anteriores.map(precoPorM3));
  const variacaoPreco = variacao(precoAtual, precoReferencia);

  const nivel = classificarVariacao(variacaoConsumo);
  const motivos = [];

  if (nivel !== NIVEIS.NORMAL) {
    motivos.push('consumo_por_pessoa_acima');
  }
  // Valor subiu por causa do preço, não do volume: aviso separado.
  if (variacaoPreco >= LIMITE_ATENCAO && variacaoConsumo < LIMITE_ATENCAO) {
    motivos.push('preco_m3_subiu');
  }
  const moradoresReferencia = media(anteriores.map((c) => c.moradores));
  if (atual.moradores !== Math.round(moradoresReferencia)) {
    motivos.push('moradores_mudaram');
  }

  return {
    nivel,
    atual,
    contasReferencia: anteriores,
    faltam: 0,
    consumoAtual,
    consumoReferencia,
    variacaoConsumo,
    precoAtual,
    precoReferencia,
    variacaoPreco,
    motivos,
  };
}

// Série para o gráfico: cada conta com o consumo normalizado.
export function montarHistorico(contas) {
  return ordenarPorMes(contas).map((conta) => ({
    ...conta,
    litrosPessoaDia: litrosPorPessoaDia(conta),
    precoM3: precoPorM3(conta),
  }));
}

// Evolução depois de uma verificação: compara cada conta seguinte com a conta analisada.
export function evolucaoAposMes(contas, mes) {
  const ordenadas = ordenarPorMes(contas);
  const base = ordenadas.find((c) => c.mes === mes);
  if (!base) return { base: null, seguintes: [] };
  const consumoBase = litrosPorPessoaDia(base);
  const seguintes = ordenadas
    .filter((c) => c.mes > mes)
    .map((c) => {
      const litros = litrosPorPessoaDia(c);
      return { mes: c.mes, litros, variacao: variacao(litros, consumoBase) };
    });
  return { base: { mes: base.mes, litros: consumoBase }, seguintes };
}
