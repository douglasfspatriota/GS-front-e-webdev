// Inicia a API local em http://localhost:3001.
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { abrirBanco } from './banco.js';
import { criarApp } from './app.js';

const pasta = dirname(fileURLToPath(import.meta.url));
const pastaDados = join(pasta, 'dados');
mkdirSync(pastaDados, { recursive: true });

const banco = abrirBanco(process.env.CAMINHO_BANCO ?? join(pastaDados, 'gota-alerta.db'));
const app = criarApp(banco);
const porta = Number(process.env.PORT ?? 3001);

app.listen(porta, () => {
  console.log(`API do Gota Alerta em http://localhost:${porta}/api`);
});
