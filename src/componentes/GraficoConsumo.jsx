// Gráfico de barras em SVG: litros por pessoa por dia em cada mês.
// Cada barra recebe foco pelo teclado e mostra os detalhes abaixo do gráfico.
import { useState } from 'react';
import { NIVEIS } from '../regras/consumo.js';
import { formatarLitros, formatarMes, formatarNumero, formatarReais } from '../regras/formatos.js';

const LARGURA = 640;
const ALTURA = 260;
const MARGEM = { topo: 16, direita: 12, base: 36, esquerda: 48 };

const COR_NIVEL = {
  [NIVEIS.NORMAL]: '#059669',
  [NIVEIS.ATENCAO]: '#d97706',
  [NIVEIS.INVESTIGAR]: '#dc2626',
  [NIVEIS.SEM_REFERENCIA]: '#0e7490',
};

// Escala com valores "redondos" no eixo (0, 100, 200…).
function passoDoEixo(maximo) {
  const bruto = maximo / 4;
  const potencia = 10 ** Math.floor(Math.log10(bruto || 1));
  return [1, 2, 2.5, 5, 10].map((m) => m * potencia).find((p) => p >= bruto);
}

export default function GraficoConsumo({ historico, referencia, nivel }) {
  const [selecionado, setSelecionado] = useState(null);

  if (historico.length === 0) return null;

  const maiorValor = Math.max(...historico.map((c) => c.litrosPessoaDia), referencia ?? 0);
  const passo = passoDoEixo(maiorValor);
  const topoEixo = Math.ceil(maiorValor / passo) * passo || passo;
  const marcas = Array.from({ length: Math.round(topoEixo / passo) + 1 }, (_, i) => i * passo);

  const areaL = LARGURA - MARGEM.esquerda - MARGEM.direita;
  const areaA = ALTURA - MARGEM.topo - MARGEM.base;
  const y = (v) => MARGEM.topo + areaA - (v / topoEixo) * areaA;
  const faixa = areaL / historico.length;
  const larguraBarra = Math.min(56, faixa * 0.6);

  const detalhe = selecionado === null ? historico.at(-1) : historico[selecionado];

  return (
    <section aria-labelledby="titulo-grafico" className="space-y-3 rounded-2xl border border-agua-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="titulo-grafico" className="text-xl font-bold text-agua-900">Consumo mês a mês</h2>
        <p className="text-sm text-slate-600">Litros por pessoa por dia</p>
      </div>

      <svg
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        className="h-auto w-full"
        role="group"
        aria-label="Gráfico de barras do consumo por pessoa por dia. Use Tab para percorrer os meses."
      >
        {marcas.map((m) => (
          <g key={m} aria-hidden="true">
            <line x1={MARGEM.esquerda} x2={LARGURA - MARGEM.direita} y1={y(m)} y2={y(m)} stroke="#e2e8f0" />
            <text x={MARGEM.esquerda - 8} y={y(m)} textAnchor="end" dominantBaseline="middle" className="fill-slate-500 text-[12px]">
              {formatarNumero(m)}
            </text>
          </g>
        ))}

        {historico.map((c, i) => {
          const ultimo = i === historico.length - 1;
          const cx = MARGEM.esquerda + faixa * i + faixa / 2;
          const topo = y(c.litrosPessoaDia);
          const ativo = detalhe === c;
          return (
            <g
              key={c.id}
              tabIndex={0}
              role="img"
              aria-label={`${formatarMes(c.mes)}: ${formatarLitros(c.litrosPessoaDia)} por pessoa por dia`}
              onFocus={() => setSelecionado(i)}
              onMouseEnter={() => setSelecionado(i)}
              onClick={() => setSelecionado(i)}
              className="cursor-pointer outline-none [&:focus-visible>rect:first-child]:stroke-agua-900 [&:focus-visible>rect:first-child]:stroke-[3]"
            >
              <rect
                x={cx - larguraBarra / 2}
                y={topo}
                width={larguraBarra}
                height={Math.max(0, MARGEM.topo + areaA - topo)}
                rx="4"
                fill={ultimo ? COR_NIVEL[nivel] : '#67c6d6'}
                opacity={ativo ? 1 : 0.85}
              />
              {/* área de clique maior que a barra */}
              <rect x={cx - faixa / 2} y={MARGEM.topo} width={faixa} height={areaA} fill="transparent" />
              <text x={cx} y={ALTURA - MARGEM.base + 18} textAnchor="middle" className={`text-[12px] ${ativo ? 'fill-slate-900 font-bold' : 'fill-slate-600'}`}>
                {formatarMes(c.mes).split('/')[0]}
              </text>
            </g>
          );
        })}

        {referencia > 0 && (
          <g aria-hidden="true">
            <line
              x1={MARGEM.esquerda}
              x2={LARGURA - MARGEM.direita}
              y1={y(referencia)}
              y2={y(referencia)}
              stroke="#164e63"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            <text x={LARGURA - MARGEM.direita} y={y(referencia) - 6} textAnchor="end" className="fill-agua-900 text-[12px] font-bold">
              média de referência {formatarLitros(referencia)}
            </text>
          </g>
        )}
      </svg>

      <div aria-live="polite" className="flex flex-wrap gap-x-6 gap-y-1 rounded-xl bg-agua-50 px-4 py-3 text-sm text-agua-900">
        <strong>{formatarMes(detalhe.mes)}</strong>
        <span>{formatarLitros(detalhe.litrosPessoaDia)} por pessoa/dia</span>
        <span>{formatarNumero(detalhe.volume_m3, 1)} m³ em {detalhe.dias} dias</span>
        <span>{detalhe.moradores} moradores</span>
        <span>{formatarReais(detalhe.valor_reais)} ({formatarReais(detalhe.precoM3)}/m³)</span>
      </div>
    </section>
  );
}
