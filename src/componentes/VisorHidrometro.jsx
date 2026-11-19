// Visor inspirado no mostrador do hidrômetro: dígitos em caixas, fonte mono.
export default function VisorHidrometro({ valor, unidade, legenda, casas = 4 }) {
  const inteiro = Math.max(0, Math.round(Number(valor) || 0));
  const digitos = String(inteiro).padStart(casas, '0').split('');

  return (
    <figure className="inline-flex flex-col items-center gap-3 rounded-3xl bg-slate-900 p-5 text-white shadow-lg ring-4 ring-slate-300">
      <div className="flex items-end gap-2" aria-hidden="true">
        <div className="flex gap-1 rounded-xl bg-slate-950 p-2">
          {digitos.map((d, i) => (
            <span
              key={i}
              className="flex h-14 w-10 items-center justify-center rounded-md bg-white font-mono text-4xl font-bold text-slate-900 sm:h-16 sm:w-12 sm:text-5xl"
            >
              {d}
            </span>
          ))}
        </div>
        <span className="pb-1 font-mono text-xl font-bold text-agua-200">{unidade}</span>
      </div>
      <figcaption className="text-center text-sm text-slate-200">
        <span className="sr-only">{inteiro} {unidade} </span>
        {legenda}
      </figcaption>
    </figure>
  );
}
