// Campo de formulário com rótulo ligado ao input, dica e mensagem de erro.
import { useId } from 'react';

export default function Campo({ rotulo, dica, erro, sufixo, id, className = '', ...props }) {
  const idGerado = useId();
  const idCampo = id ?? idGerado;
  const idDica = `${idCampo}-dica`;
  const idErro = `${idCampo}-erro`;
  const descritoPor = [dica && idDica, erro && idErro].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={idCampo} className="font-semibold text-slate-800">
        {rotulo}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={idCampo}
          aria-invalid={erro ? 'true' : undefined}
          aria-describedby={descritoPor}
          className={`min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-base ${
            erro ? 'border-red-600' : 'border-slate-300'
          }`}
          {...props}
        />
        {sufixo && <span className="shrink-0 text-sm text-slate-600">{sufixo}</span>}
      </div>
      {dica && <p id={idDica} className="text-sm text-slate-600">{dica}</p>}
      {erro && <p id={idErro} className="text-sm font-semibold text-red-700">{erro}</p>}
    </div>
  );
}
