// Rodapé com equipe, contexto acadêmico e o aviso sobre os dados.
export default function Rodape() {
  return (
    <footer className="mt-16 border-t border-agua-100 bg-white">
      <div className="mx-auto max-w-6xl space-y-2 px-4 py-6 text-sm text-slate-600">
        <p>
          <strong className="text-slate-800">Gota Alerta</strong> · Global Solution CitizenTech · FIAP · 2º semestre de
          2026 · Turma 1ESR · Aclimação e Cambuci, São Paulo
        </p>
        <p>
          Equipe: Octavio Kal Oliveira Lima, Vitor Santos Cintra, Guilherme Zeferino Gonçalves, Douglas Ferreira Santos
          Patriota e Pedro Henrique Santos de Brito.
        </p>
        <p>Protótipo acadêmico. Uma conta alta não comprova vazamento. Os dados de demonstração são fictícios.</p>
      </div>
    </footer>
  );
}
