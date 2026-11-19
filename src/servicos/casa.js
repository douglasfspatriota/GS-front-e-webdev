// Identificador anônimo da casa, gerado uma vez e guardado no navegador.
// Não contém nome, e-mail nem endereço: só separa os dados de cada casa na API.

const CHAVE = 'gota-alerta:casa-id';
let emMemoria = null;

function gerarId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `casa-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function obterCasaId() {
  try {
    let id = localStorage.getItem(CHAVE);
    if (!id) {
      id = gerarId();
      localStorage.setItem(CHAVE, id);
    }
    return id;
  } catch {
    // Navegação privada ou armazenamento bloqueado: usa um id só desta sessão.
    emMemoria ??= gerarId();
    return emMemoria;
  }
}

// Apaga o identificador: a casa passa a começar do zero neste navegador.
export function novaCasa() {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    /* sem armazenamento: nada a apagar */
  }
  emMemoria = null;
  return obterCasaId();
}
