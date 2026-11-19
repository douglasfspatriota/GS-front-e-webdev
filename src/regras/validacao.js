// Validação dos dados de uma conta de água.
// Usada no formulário (antes de enviar) e na API (antes de gravar).

export const LIMITES_CONTA = {
  volumeMaximo: 1000, // m³ por período: acima disso é quase certamente erro de digitação
  diasMinimo: 1,
  diasMaximo: 62,
  moradoresMaximo: 30,
};

// Aceita número ou texto com vírgula decimal ("18,5").
export function paraNumero(valor) {
  if (typeof valor === 'number') return valor;
  if (typeof valor !== 'string' || valor.trim() === '') return NaN;
  return Number(valor.trim().replace(/\./g, '').replace(',', '.'));
}

// Lê um número digitado: "18,5", "18.5" ou "1.000,50".
export function lerNumero(valor) {
  if (typeof valor === 'number') return valor;
  if (typeof valor !== 'string' || valor.trim() === '') return NaN;
  const texto = valor.trim();
  // "18.5" (ponto decimal) também é aceito quando não há vírgula
  return texto.includes(',') ? paraNumero(texto) : Number(texto);
}

const FORMATO_MES = /^\d{4}-(0[1-9]|1[0-2])$/;

export function validarConta(dados = {}, { hoje = new Date() } = {}) {
  const erros = {};
  const mes = String(dados.mes ?? '').trim();
  const volume_m3 = lerNumero(dados.volume_m3);
  const valor_reais = lerNumero(dados.valor_reais);
  const dias = lerNumero(dados.dias);
  const moradores = lerNumero(dados.moradores);

  if (!FORMATO_MES.test(mes)) {
    erros.mes = 'Informe o mês no formato AAAA-MM.';
  } else {
    const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
    if (mes > mesAtual) erros.mes = 'O mês da conta não pode estar no futuro.';
  }

  if (!Number.isFinite(volume_m3) || volume_m3 <= 0) {
    erros.volume_m3 = 'Informe o volume consumido, maior que zero.';
  } else if (volume_m3 > LIMITES_CONTA.volumeMaximo) {
    erros.volume_m3 = `O volume parece alto demais (máximo ${LIMITES_CONTA.volumeMaximo} m³). Confira a conta.`;
  }

  if (!Number.isFinite(valor_reais) || valor_reais < 0) {
    erros.valor_reais = 'Informe o valor cobrado (zero ou mais).';
  }

  if (!Number.isInteger(dias) || dias < LIMITES_CONTA.diasMinimo || dias > LIMITES_CONTA.diasMaximo) {
    erros.dias = `Informe os dias do período, entre ${LIMITES_CONTA.diasMinimo} e ${LIMITES_CONTA.diasMaximo}.`;
  }

  if (!Number.isInteger(moradores) || moradores < 1 || moradores > LIMITES_CONTA.moradoresMaximo) {
    erros.moradores = `Informe quantas pessoas moram na casa, entre 1 e ${LIMITES_CONTA.moradoresMaximo}.`;
  }

  const valido = Object.keys(erros).length === 0;
  return {
    valido,
    erros,
    conta: valido ? { mes, volume_m3, valor_reais, dias, moradores } : null,
  };
}

// Cada mês só pode ter uma conta por casa.
export function mesJaCadastrado(contas, mes, idIgnorado = null) {
  return contas.some((c) => c.mes === mes && c.id !== idIgnorado);
}
