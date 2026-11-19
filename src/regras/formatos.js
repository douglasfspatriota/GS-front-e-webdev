// Formatação de números e datas para exibição (pt-BR).

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function formatarMes(mes) {
  const [ano, m] = String(mes).split('-');
  const indice = Number(m) - 1;
  if (!ano || !(indice >= 0 && indice < 12)) return String(mes);
  return `${MESES[indice]}/${ano}`;
}

export function formatarNumero(valor, casas = 0) {
  return Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

export function formatarLitros(valor) {
  return `${formatarNumero(valor, 0)} L`;
}

export function formatarReais(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarPercentual(valor) {
  const sinal = valor > 0 ? '+' : '';
  return `${sinal}${formatarNumero(valor * 100, 0)}%`;
}
