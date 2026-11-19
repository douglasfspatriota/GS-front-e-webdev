// Botão reutilizável com variantes visuais e ícone opcional.
const VARIANTES = {
  primario: 'bg-agua-700 text-white hover:bg-agua-800 disabled:bg-slate-400',
  secundario: 'bg-white text-agua-800 ring-1 ring-inset ring-agua-700 hover:bg-agua-50 disabled:text-slate-400 disabled:ring-slate-300',
  perigo: 'bg-red-700 text-white hover:bg-red-800 disabled:bg-slate-400',
  fantasma: 'text-agua-800 hover:bg-agua-50 disabled:text-slate-400',
};

export default function Botao({
  variante = 'primario',
  icone: Icone,
  carregando = false,
  className = '',
  children,
  type = 'button',
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || carregando}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 font-semibold transition-colors disabled:cursor-not-allowed ${VARIANTES[variante]} ${className}`}
      {...props}
    >
      {Icone && <Icone aria-hidden="true" className="size-5 shrink-0" />}
      {carregando ? 'Aguarde…' : children}
    </button>
  );
}
