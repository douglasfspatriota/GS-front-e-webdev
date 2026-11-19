// Rotas REST de /api/verificacoes.
import { Router } from 'express';
import { validarVerificacao, validarAtualizacaoVerificacao } from '../../src/regras/verificacao.js';

export function rotasVerificacoes(repo) {
  const rotas = Router();

  rotas.get('/', (req, res) => {
    res.json(repo.listar(req.casaId));
  });

  rotas.post('/', (req, res) => {
    const { valido, erros, verificacao } = validarVerificacao(req.body);
    if (!valido) return res.status(422).json({ erro: 'Dados inválidos.', erros });
    res.status(201).json(repo.criar(req.casaId, verificacao));
  });

  rotas.put('/:id', (req, res) => {
    const { valido, erros, alteracao } = validarAtualizacaoVerificacao(req.body);
    if (!valido) return res.status(422).json({ erro: 'Dados inválidos.', erros });
    const atualizada = repo.atualizar(req.casaId, Number(req.params.id), alteracao);
    if (!atualizada) return res.status(404).json({ erro: 'Verificação não encontrada.' });
    res.json(atualizada);
  });

  rotas.delete('/:id', (req, res) => {
    if (!repo.excluir(req.casaId, Number(req.params.id))) {
      return res.status(404).json({ erro: 'Verificação não encontrada.' });
    }
    res.status(204).end();
  });

  return rotas;
}
