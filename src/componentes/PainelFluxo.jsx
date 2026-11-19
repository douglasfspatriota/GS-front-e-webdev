// Painel do monitor: estado atual, vazão suavizada, tempo de fluxo contínuo e gráfico das leituras.
import { CircleCheck, TriangleAlert, Siren, Unplug } from 'lucide-react';
import { ESTADOS_FLUXO, CONFIG_FLUXO } from '../regras/fluxo.js';
import { formatarNumero } from '../regras/formatos.js';

export const INFO_ESTADOS = {
  [ESTADOS_FLUXO.NORMAL]: {
    rotulo: 'Normal',
    descricao: 'Sem fluxo contínuo. O uso liga e desliga normalmente.',
    icone: CircleCheck,
    classes: 'bg-emerald-100 text-emerald-900 ring-emerald-300',
  },
  [ESTADOS_FLUXO.ATENCAO]: {
    rotulo: 'Atenção',
    descricao: `Água correndo sem pausa há mais de ${CONFIG_FLUXO.segundosAtencao} s. Alguém está usando?`,
    icone: TriangleAlert,
    classes: 'bg-amber-100 text-amber-950 ring-amber-300',
  },
  [ESTADOS_FLUXO.SUSPEITA]: {
    rotulo: 'Suspeita de vazamento',
    descricao: `Fluxo contínuo há mais de ${CONFIG_FLUXO.segundosSuspeita} s. Confira torneiras, descarga e caixa-d’água.`,
    icone: Siren,
    classes: 'bg-red-100 text-red-900 ring-red-300',
  },
  [ESTADOS_FLUXO.SENSOR_INVALIDO]: {
    rotulo: 'Sensor inválido',
    descricao: 'Leitura fora da faixa ou sensor sem resposta. Os alertas ficam suspensos até voltar.',
    icone: Unplug,
    classes: 'bg-slate-200 text-slate-900 ring-slate-400',
  },
};

const L = 600;
const A = 140;

function GraficoLeituras({ leituras }) {
  const validas = leituras.map((l) => (typeof l.vazao === 'number' && Number.isFinite(l.vazao) ? l.vazao : null));
  const maximo = Math.max(1, ...validas.filter((v) => v !== null));
  const passoX = L / 59;
  const pontos = validas
    .map((v, i) => (v === null ? null : `${(i + (60 - validas.length)) * passoX},${A - 8 - (v / maximo) * (A - 16)}`))
    .filter(Boolean)
    .join(' ');
  const yLimiar = A - 8 - (CONFIG_FLUXO.limiarFluxo / maximo) * (A - 16);

  return (
    <svg viewBox={`0 0 ${L} ${A}`} preserveAspectRatio="none" className="block h-36 w-full rounded-xl bg-slate-900" aria-hidden="true">
      <line x1="0" x2={L} y1={yLimiar} y2={yLimiar} stroke="#475569" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
      {pontos && <polyline points={pontos} fill="none" stroke="#22d3ee" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />}
    </svg>
  );
}

export default function PainelFluxo({ monitor, leituras }) {
  const info = INFO_ESTADOS[monitor.estado];
  const Icone = info.icone;
  const ultima = leituras.at(-1);

  return (
    <section aria-labelledby="titulo-painel" className="space-y-4 rounded-2xl border border-agua-100 bg-white p-5 shadow-sm">
      <h2 id="titulo-painel" className="sr-only">Estado do monitor</h2>
      <div role="status" aria-live="polite" className={`flex items-start gap-3 rounded-xl p-4 ring-1 ring-inset ${info.classes}`}>
        <Icone aria-hidden="true" className="size-8 shrink-0" />
        <div>
          <p className="text-xl font-bold">{info.rotulo}</p>
          <p className="text-sm">{info.descricao}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-agua-50 p-3">
          <dt className="text-sm text-agua-900">Vazão suavizada</dt>
          <dd className="font-mono text-2xl font-bold">{formatarNumero(monitor.suavizada, 2)} L/min</dd>
        </div>
        <div className="rounded-xl bg-agua-50 p-3">
          <dt className="text-sm text-agua-900">Fluxo sem pausa</dt>
          <dd className="font-mono text-2xl font-bold">{formatarNumero(monitor.segundosContinuos, 0)} s</dd>
        </div>
        <div className="col-span-2 rounded-xl bg-agua-50 p-3 sm:col-span-1">
          <dt className="text-sm text-agua-900">Última leitura</dt>
          <dd className="font-mono text-2xl font-bold">
            {!ultima ? '—' : ultima.vazao === null || !Number.isFinite(ultima.vazao) ? 'falha' : `${formatarNumero(ultima.vazao, 2)} L/min`}
          </dd>
        </div>
      </dl>

      <div>
        <GraficoLeituras leituras={leituras} />
        <p className="mt-1 text-sm text-slate-600">
          Últimas {leituras.length} leituras (uma por segundo). A linha tracejada é o limite de {formatarNumero(CONFIG_FLUXO.limiarFluxo, 1)} L/min para considerar que há fluxo.
        </p>
      </div>
    </section>
  );
}
