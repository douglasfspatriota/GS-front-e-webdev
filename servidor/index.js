// Inicia a API em http://localhost:3001.
// Com --servir-site (npm start), também serve o site já compilado na pasta dist.
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { abrirBanco } from './banco.js';
import { criarApp } from './app.js';

const pasta = dirname(fileURLToPath(import.meta.url));
const pastaDados = process.env.PASTA_DADOS ?? join(pasta, 'dados');
mkdirSync(pastaDados, { recursive: true });

const servirSite = process.argv.includes('--servir-site');
const pastaSite = join(pasta, '..', 'dist');
if (servirSite && !existsSync(join(pastaSite, 'index.html'))) {
  console.error('Pasta dist não encontrada. Rode "npm run build" antes de "npm start".');
  process.exit(1);
}

const banco = abrirBanco(process.env.CAMINHO_BANCO ?? join(pastaDados, 'gota-alerta.db'));
const app = criarApp(banco, { pastaSite: servirSite ? pastaSite : null });
const porta = Number(process.env.PORT ?? 3001);

app.listen(porta, () => {
  console.log(servirSite ? `Gota Alerta em http://localhost:${porta}` : `API do Gota Alerta em http://localhost:${porta}/api`);
});
