// Selo do nível do alerta: sempre com ícone e texto, não só com cor.
import { CircleCheck, CircleHelp, TriangleAlert, Search } from 'lucide-react';
import { NIVEIS } from '../regras/consumo.js';

export const INFO_NIVEIS = {
  [NIVEIS.NORMAL]: {
    rotulo: 'Dentro do padrão',
    icone: CircleCheck,
    classes: 'bg-emerald-100 text-emerald-900 ring-emerald-300',
  },
  [NIVEIS.ATENCAO]: {
    rotulo: 'Atenção',
    icone: TriangleAlert,
    classes: 'bg-amber-100 text-amber-950 ring-amber-300',
  },
  [NIVEIS.INVESTIGAR]: {
    rotulo: 'Investigar aumento',
    icone: Search,
    classes: 'bg-red-100 text-red-900 ring-red-300',
  },
  [NIVEIS.SEM_REFERENCIA]: {
    rotulo: 'Sem referência suficiente',
    icone: CircleHelp,
    classes: 'bg-slate-100 text-slate-800 ring-slate-300',
  },
};

export default function SeloNivel({ nivel, tamanho = 'normal' }) {
  const { rotulo, icone: Icone, classes } = INFO_NIVEIS[nivel] ?? INFO_NIVEIS[NIVEIS.SEM_REFERENCIA];
  const grande = tamanho === 'grande';
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full font-bold ring-1 ring-inset ${classes} ${
        grande ? 'px-4 py-2 text-lg' : 'px-3 py-1 text-sm'
      }`}
    >
      <Icone aria-hidden="true" className={grande ? 'size-6' : 'size-4'} />
      {rotulo}
    </span>
  );
}
