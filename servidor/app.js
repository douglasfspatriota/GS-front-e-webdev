// Monta a aplicação Express. Recebe o banco por parâmetro para facilitar os testes.
import express from 'express';
import { join } from 'node:path';
import { criarRepositorioContas } from './repositorios/contas.js';
import { criarRepositorioVerificacoes } from './repositorios/verificacoes.js';
import { rotasContas } from './rotas/contas.js';
import { rotasVerificacoes } from './rotas/verificacoes.js';

const FORMATO_CASA_ID = /^[A-Za-z0-9-]{8,64}$/;

// Cada navegador gera um identificador anônimo da casa e o envia em X-Casa-Id.
// Ele separa os dados de cada casa sem pedir nome, e-mail ou endereço.
function exigirCasa(req, res, next) {
  const casaId = req.get('X-Casa-Id');
  if (!casaId || !FORMATO_CASA_ID.test(casaId)) {
    return res.status(400).json({ erro: 'Cabeçalho X-Casa-Id ausente ou inválido.' });
  }
  req.casaId = casaId;
  next();
}

// Erros gerais: JSON malformado vira 400; o resto, 500 sem expor detalhes.
function tratarErros(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'O corpo da requisição não é um JSON válido.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ erro: 'Requisição grande demais.' });
  }
  console.error(err);
  res.status(500).json({ erro: 'Erro interno no servidor.' });
}

// opcoes.pastaSite: pasta do build do Vite (dist) para servir o site junto com a API.
export function criarApp(banco, opcoes = {}) {
  const app = express();
  app.use(express.json({ limit: '50kb' }));

  app.get('/api/saude', (req, res) => res.json({ ok: true }));
  app.use('/api', exigirCasa);
  app.use('/api/contas', rotasContas(criarRepositorioContas(banco)));
  app.use('/api/verificacoes', rotasVerificacoes(criarRepositorioVerificacoes(banco)));
  app.use('/api', (req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

  if (opcoes.pastaSite) {
    app.use(express.static(opcoes.pastaSite));
    // Qualquer outra rota GET devolve o index.html: o React Router decide a página.
    app.use((req, res, next) => {
      if (req.method !== 'GET') return next();
      res.sendFile(join(opcoes.pastaSite, 'index.html'));
    });
  }

  app.use(tratarErros);

  return app;
}
