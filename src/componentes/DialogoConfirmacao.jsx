// Diálogo modal de confirmação usando o elemento nativo <dialog>
// (prende o foco e fecha com Esc sem código extra).
import { useEffect, useRef } from 'react';
import Botao from './Botao.jsx';

export default function DialogoConfirmacao({
  aberto,
  titulo,
  children,
  textoConfirmar = 'Confirmar',
  variante = 'perigo',
  carregando = false,
  onConfirmar,
  onCancelar,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (aberto && !dialogo.open) dialogo.showModal();
    if (!aberto && dialogo.open) dialogo.close();
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onCancelar();
      }}
      aria-labelledby="dialogo-titulo"
      className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-2xl p-0 shadow-xl backdrop:bg-slate-900/50"
    >
      <div className="space-y-4 p-6">
        <h2 id="dialogo-titulo" className="text-xl font-bold text-slate-900">{titulo}</h2>
        <div className="text-slate-700">{children}</div>
        <div className="flex flex-wrap justify-end gap-2">
          <Botao variante="secundario" onClick={onCancelar} autoFocus>
            Cancelar
          </Botao>
          <Botao variante={variante} onClick={onConfirmar} carregando={carregando}>
            {textoConfirmar}
          </Botao>
        </div>
      </div>
    </dialog>
  );
}
