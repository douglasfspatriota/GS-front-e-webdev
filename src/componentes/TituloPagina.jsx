// Cabeçalho padrão de cada página: título, descrição e ações à direita.
export default function TituloPagina({ titulo, descricao, acoes }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-agua-900">{titulo}</h1>
        {descricao && <p className="max-w-2xl text-slate-700">{descricao}</p>}
      </div>
      {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
    </div>
  );
}
