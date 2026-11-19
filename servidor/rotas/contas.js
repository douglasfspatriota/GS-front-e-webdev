// Rotas REST de /api/contas. Usa a mesma validação do formulário (src/regras).
import { Router } from 'express';
import { validarConta } from '../../src/regras/validacao.js';

export function rotasContas(repo) {
  const rotas = Router();

  rotas.get('/', (req, res) => {
    res.json(repo.listar(req.casaId));
  });

  rotas.get('/:id', (req, res) => {
    const conta = repo.buscar(req.casaId, Number(req.params.id));
    if (!conta) return res.status(404).json({ erro: 'Conta não encontrada.' });
    res.json(conta);
  });

  rotas.post('/', (req, res) => {
    const { valido, erros, conta } = validarConta(req.body);
    if (!valido) return res.status(422).json({ erro: 'Dados inválidos.', erros });
    if (repo.mesOcupado(req.casaId, conta.mes)) {
      return res.status(409).json({ erro: 'Já existe uma conta para este mês.', erros: { mes: 'Mês já cadastrado.' } });
    }
    res.status(201).json(repo.criar(req.casaId, conta));
  });

  rotas.put('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!repo.buscar(req.casaId, id)) return res.status(404).json({ erro: 'Conta não encontrada.' });
    const { valido, erros, conta } = validarConta(req.body);
    if (!valido) return res.status(422).json({ erro: 'Dados inválidos.', erros });
    if (repo.mesOcupado(req.casaId, conta.mes, id)) {
      return res.status(409).json({ erro: 'Já existe uma conta para este mês.', erros: { mes: 'Mês já cadastrado.' } });
    }
    res.json(repo.atualizar(req.casaId, id, conta));
  });

  rotas.delete('/:id', (req, res) => {
    if (!repo.excluir(req.casaId, Number(req.params.id))) {
      return res.status(404).json({ erro: 'Conta não encontrada.' });
    }
    res.status(204).end();
  });

  return rotas;
}
