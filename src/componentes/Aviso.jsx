// Caixa de mensagem com ícone e texto (o significado nunca depende só da cor).
import { CircleCheck, Info, TriangleAlert, OctagonAlert } from 'lucide-react';

const TIPOS = {
  info: { icone: Info, classes: 'border-agua-200 bg-agua-50 text-agua-900' },
  sucesso: { icone: CircleCheck, classes: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
  atencao: { icone: TriangleAlert, classes: 'border-amber-300 bg-amber-50 text-amber-950' },
  erro: { icone: OctagonAlert, classes: 'border-red-300 bg-red-50 text-red-900' },
};

export default function Aviso({ tipo = 'info', titulo, children, acao, className = '' }) {
  const { icone: Icone, classes } = TIPOS[tipo];
  const urgente = tipo === 'erro';
  return (
    <div
      role={urgente ? 'alert' : 'status'}
      className={`flex gap-3 rounded-xl border p-4 ${classes} ${className}`}
    >
      <Icone aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div className="flex-1 space-y-1">
        {titulo && <p className="font-bold">{titulo}</p>}
        {children && <div className="text-sm leading-relaxed">{children}</div>}
        {acao && <div className="pt-2">{acao}</div>}
      </div>
    </div>
  );
}
