// Explica o resultado da análise com os números usados, em linguagem simples.
import { NIVEIS, LIMITE_ATENCAO, LIMITE_INVESTIGAR } from '../regras/consumo.js';
import { formatarLitros, formatarMes, formatarPercentual, formatarReais } from '../regras/formatos.js';

export default function ExplicacaoAnalise({ analise }) {
  const {
    nivel, atual, contasReferencia, consumoAtual, consumoReferencia, variacaoConsumo,
    precoAtual, precoReferencia, variacaoPreco, motivos,
  } = analise;

  const conclusao = {
    [NIVEIS.NORMAL]: `A variação ficou abaixo de ${formatarPercentual(LIMITE_ATENCAO)}, o limite de atenção. O consumo está dentro do padrão da sua casa.`,
    [NIVEIS.ATENCAO]: `A variação passou de ${formatarPercentual(LIMITE_ATENCAO)}, o limite de atenção. Vale observar as próximas contas e pensar no que mudou na rotina.`,
    [NIVEIS.INVESTIGAR]: `A variação passou de ${formatarPercentual(LIMITE_INVESTIGAR)}, o limite para investigar. Recomendamos responder o questionário e conferir a casa.`,
  }[nivel];

  return (
    <section aria-labelledby="titulo-explicacao" className="space-y-4 rounded-2xl border border-agua-100 bg-white p-5 shadow-sm">
      <h2 id="titulo-explicacao" className="text-xl font-bold text-agua-900">Por que este resultado?</h2>

      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-agua-50 p-3">
          <dt className="text-sm text-agua-900">Conta de {formatarMes(atual.mes)}</dt>
          <dd className="font-mono text-2xl font-bold">{formatarLitros(consumoAtual)}</dd>
          <dd className="text-sm text-slate-600">por pessoa por dia</dd>
        </div>
        <div className="rounded-xl bg-agua-50 p-3">
          <dt className="text-sm text-agua-900">Média das {contasReferencia.length} contas anteriores</dt>
          <dd className="font-mono text-2xl font-bold">{formatarLitros(consumoReferencia)}</dd>
          <dd className="text-sm text-slate-600">
            {formatarMes(contasReferencia[0].mes)} a {formatarMes(contasReferencia.at(-1).mes)}
          </dd>
        </div>
        <div className="rounded-xl bg-agua-50 p-3">
          <dt className="text-sm text-agua-900">Variação do consumo</dt>
          <dd className="font-mono text-2xl font-bold">{formatarPercentual(variacaoConsumo)}</dd>
          <dd className="text-sm text-slate-600">em relação à média</dd>
        </div>
      </dl>

      <p className="leading-relaxed">
        Na conta de <strong>{formatarMes(atual.mes)}</strong>, cada pessoa usou em média{' '}
        <strong>{formatarLitros(consumoAtual)}</strong> por dia ({atual.volume_m3} m³ ÷ {atual.dias} dias ÷{' '}
        {atual.moradores} moradores). {conclusao}
      </p>

      <div className="space-y-2">
        <h3 className="font-bold text-slate-800">Valor em reais, analisado à parte</h3>
        <p className="leading-relaxed text-slate-700">
          O preço médio foi de <strong>{formatarReais(precoAtual)}</strong> por m³, contra{' '}
          {formatarReais(precoReferencia)} nas contas anteriores ({formatarPercentual(variacaoPreco)}).
          {motivos.includes('preco_m3_subiu') &&
            ' O valor subiu mais pelo preço do que pelo volume: pode ser reajuste de tarifa ou mudança de faixa, não necessariamente mais consumo.'}
        </p>
      </div>

      {motivos.includes('moradores_mudaram') && (
        <p className="rounded-xl bg-amber-50 p-3 text-amber-950">
          O número de moradores mudou em relação às contas anteriores. O cálculo por pessoa já considera isso, mas
          visitas longas e mudanças de rotina também alteram o consumo.
        </p>
      )}

      <p className="text-sm text-slate-600">
        Os limites de 20% e 50% são hipóteses do protótipo, sem validação em campo. Uma conta alta não comprova
        vazamento.
      </p>
    </section>
  );
}
