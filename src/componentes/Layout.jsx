// Estrutura comum a todas as páginas: link de pular, cabeçalho, conteúdo e rodapé.
import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import Cabecalho from './Cabecalho.jsx';
import Rodape from './Rodape.jsx';

export default function Layout() {
  const local = useLocation();
  const conteudo = useRef(null);
  const primeiraCarga = useRef(true);

  // Ao trocar de página, leva o foco para o conteúdo (quem usa teclado ou leitor
  // de tela não precisa voltar ao topo) e rola para o início.
  useEffect(() => {
    if (primeiraCarga.current) {
      primeiraCarga.current = false;
      return;
    }
    window.scrollTo(0, 0);
    conteudo.current?.focus({ preventScroll: true });
  }, [local.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-lg bg-agua-900 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Pular para o conteúdo
      </a>
      <Cabecalho />
      <main ref={conteudo} id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 outline-none">
        <Outlet />
      </main>
      <Rodape />
    </div>
  );
}
