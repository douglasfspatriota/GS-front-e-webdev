// Banco SQLite embutido no Node (node:sqlite), sem dependência extra.
import { DatabaseSync } from 'node:sqlite';

const ESQUEMA = `
  CREATE TABLE IF NOT EXISTS contas (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    casa_id     TEXT    NOT NULL,
    mes         TEXT    NOT NULL,
    volume_m3   REAL    NOT NULL,
    valor_reais REAL    NOT NULL,
    dias        INTEGER NOT NULL,
    moradores   INTEGER NOT NULL,
    criado_em   TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE (casa_id, mes)
  );

  CREATE TABLE IF NOT EXISTS verificacoes (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    casa_id       TEXT    NOT NULL,
    conta_mes     TEXT    NOT NULL,
    respostas     TEXT    NOT NULL DEFAULT '{}',
    hipotese      TEXT    NOT NULL DEFAULT '',
    desfecho      TEXT    NOT NULL DEFAULT 'pendente',
    anotacao      TEXT    NOT NULL DEFAULT '',
    criado_em     TEXT    NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`;

export function abrirBanco(caminho = ':memory:') {
  const banco = new DatabaseSync(caminho);
  banco.exec('PRAGMA journal_mode = WAL;');
  banco.exec(ESQUEMA);
  return banco;
}
