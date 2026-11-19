// Monta a aplicação Express. Recebe o banco por parâmetro para facilitar os testes.
import express from 'express';
import { criarRepositorioContas } from './repositorios/contas.js';
import { rotasContas } from './rotas/contas.js';

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

export function criarApp(banco) {
  const app = express();
  app.use(express.json({ limit: '50kb' }));

  app.get('/api/saude', (req, res) => res.json({ ok: true }));
  app.use('/api', exigirCasa);
  app.use('/api/contas', rotasContas(criarRepositorioContas(banco)));

  return app;
}
