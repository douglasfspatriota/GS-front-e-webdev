// Acesso ao banco para a tabela de contas. Toda consulta é filtrada pela casa.

const CAMPOS = 'id, mes, volume_m3, valor_reais, dias, moradores, criado_em';

export function criarRepositorioContas(banco) {
  const listar = banco.prepare(`SELECT ${CAMPOS} FROM contas WHERE casa_id = ? ORDER BY mes`);
  const buscar = banco.prepare(`SELECT ${CAMPOS} FROM contas WHERE casa_id = ? AND id = ?`);
  const buscarPorMes = banco.prepare('SELECT id FROM contas WHERE casa_id = ? AND mes = ?');
  const inserir = banco.prepare(
    `INSERT INTO contas (casa_id, mes, volume_m3, valor_reais, dias, moradores)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const atualizar = banco.prepare(
    `UPDATE contas SET mes = ?, volume_m3 = ?, valor_reais = ?, dias = ?, moradores = ?
     WHERE casa_id = ? AND id = ?`,
  );
  const excluir = banco.prepare('DELETE FROM contas WHERE casa_id = ? AND id = ?');

  return {
    listar: (casaId) => listar.all(casaId),
    buscar: (casaId, id) => buscar.get(casaId, id) ?? null,
    mesOcupado: (casaId, mes, idIgnorado = null) => {
      const existente = buscarPorMes.get(casaId, mes);
      return Boolean(existente && existente.id !== idIgnorado);
    },
    criar: (casaId, c) => {
      const r = inserir.run(casaId, c.mes, c.volume_m3, c.valor_reais, c.dias, c.moradores);
      return buscar.get(casaId, r.lastInsertRowid);
    },
    atualizar: (casaId, id, c) => {
      const r = atualizar.run(c.mes, c.volume_m3, c.valor_reais, c.dias, c.moradores, casaId, id);
      return r.changes > 0 ? buscar.get(casaId, id) : null;
    },
    excluir: (casaId, id) => excluir.run(casaId, id).changes > 0,
  };
}
