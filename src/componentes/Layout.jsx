// Estrutura comum a todas as páginas: link de pular, cabeçalho, conteúdo e rodapé.
import { Outlet } from 'react-router';
import Cabecalho from './Cabecalho.jsx';
import Rodape from './Rodape.jsx';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-lg bg-agua-900 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Pular para o conteúdo
      </a>
      <Cabecalho />
      <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <Rodape />
    </div>
  );
}
