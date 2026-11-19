// Acesso ao banco para a tabela de verificações. As respostas ficam guardadas em JSON.

const CAMPOS = 'id, conta_mes, respostas, hipotese, desfecho, anotacao, criado_em, atualizado_em';

function deLinha(linha) {
  if (!linha) return null;
  return { ...linha, respostas: JSON.parse(linha.respostas) };
}

export function criarRepositorioVerificacoes(banco) {
  const listar = banco.prepare(`SELECT ${CAMPOS} FROM verificacoes WHERE casa_id = ? ORDER BY criado_em DESC, id DESC`);
  const buscar = banco.prepare(`SELECT ${CAMPOS} FROM verificacoes WHERE casa_id = ? AND id = ?`);
  const inserir = banco.prepare(
    `INSERT INTO verificacoes (casa_id, conta_mes, respostas, hipotese, desfecho, anotacao)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const atualizar = banco.prepare(
    `UPDATE verificacoes SET desfecho = ?, anotacao = ?, atualizado_em = datetime('now')
     WHERE casa_id = ? AND id = ?`,
  );
  const excluir = banco.prepare('DELETE FROM verificacoes WHERE casa_id = ? AND id = ?');

  return {
    listar: (casaId) => listar.all(casaId).map(deLinha),
    criar: (casaId, v) => {
      const r = inserir.run(casaId, v.conta_mes, JSON.stringify(v.respostas), v.hipotese, v.desfecho, v.anotacao);
      return deLinha(buscar.get(casaId, r.lastInsertRowid));
    },
    atualizar: (casaId, id, a) => {
      const r = atualizar.run(a.desfecho, a.anotacao, casaId, id);
      return r.changes > 0 ? deLinha(buscar.get(casaId, id)) : null;
    },
    excluir: (casaId, id) => excluir.run(casaId, id).changes > 0,
  };
}
