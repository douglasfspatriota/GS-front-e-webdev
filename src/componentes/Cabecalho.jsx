// Cabeçalho com a marca e a navegação principal (menu recolhível no celular).
import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { Droplet, Menu, X } from 'lucide-react';

export const LINKS = [
  { para: '/', rotulo: 'Minha conta' },
  { para: '/historico', rotulo: 'Histórico' },
  { para: '/investigar', rotulo: 'Investigar' },
  { para: '/verificacoes', rotulo: 'Verificações' },
  { para: '/monitor', rotulo: 'Monitor de fluxo' },
  { para: '/como-funciona', rotulo: 'Como funciona' },
];

export default function Cabecalho() {
  const [aberto, setAberto] = useState(false);
  const local = useLocation();

  // Fecha o menu do celular ao trocar de página.
  useEffect(() => {
    setAberto(false);
  }, [local.pathname]);

  const classeLink = ({ isActive }) =>
    `block rounded-lg px-3 py-2 font-semibold ${
      isActive ? 'bg-agua-700 text-white' : 'text-agua-900 hover:bg-agua-100'
    }`;

  return (
    <header className="border-b border-agua-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2 text-xl font-bold text-agua-900">
          <Droplet aria-hidden="true" className="size-7 fill-agua-600 text-agua-700" />
          Gota Alerta
        </NavLink>
        <button
          type="button"
          className="rounded-lg p-2 text-agua-900 lg:hidden"
          aria-expanded={aberto}
          aria-controls="menu-principal"
          onClick={() => setAberto((v) => !v)}
        >
          {aberto ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          <span className="sr-only">{aberto ? 'Fechar menu' : 'Abrir menu'}</span>
        </button>
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex gap-1">
            {LINKS.map((l) => (
              <li key={l.para}>
                <NavLink to={l.para} end={l.para === '/'} className={classeLink}>
                  {l.rotulo}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {aberto && (
        <nav id="menu-principal" aria-label="Principal" className="border-t border-agua-100 px-4 py-2 lg:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <li key={l.para}>
                <NavLink to={l.para} end={l.para === '/'} className={classeLink}>
                  {l.rotulo}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
