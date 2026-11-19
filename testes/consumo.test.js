import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  litrosPorPessoaDia,
  analisarConsumo,
  classificarVariacao,
  NIVEIS,
} from '../src/regras/consumo.js';
import { formatarMes, formatarPercentual } from '../src/regras/formatos.js';

const conta = (mes, volume_m3, valor_reais = volume_m3 * 9, dias = 30, moradores = 3) => ({
  mes, volume_m3, valor_reais, dias, moradores,
});

test('normaliza para litros por pessoa por dia', () => {
  // 18 m³ × 1000 ÷ 30 dias ÷ 3 moradores = 200 L
  assert.equal(litrosPorPessoaDia(conta('2026-01', 18)), 200);
  assert.equal(litrosPorPessoaDia({ volume_m3: 10, dias: 0, moradores: 2 }), 0);
});

test('classifica pelos limites de 20% e 50%', () => {
  assert.equal(classificarVariacao(0.19), NIVEIS.NORMAL);
  assert.equal(classificarVariacao(0.2), NIVEIS.ATENCAO);
  assert.equal(classificarVariacao(0.49), NIVEIS.ATENCAO);
  assert.equal(classificarVariacao(0.5), NIVEIS.INVESTIGAR);
});

test('exige pelo menos 3 contas anteriores como referência', () => {
  const r = analisarConsumo([conta('2026-01', 18), conta('2026-02', 18), conta('2026-03', 30)]);
  assert.equal(r.nivel, NIVEIS.SEM_REFERENCIA);
  assert.equal(r.faltam, 1);
});

test('usa no máximo as 6 contas anteriores', () => {
  const contas = [conta('2025-12', 90)];
  for (let m = 1; m <= 6; m++) contas.push(conta(`2026-0${m}`, 18));
  contas.push(conta('2026-07', 18));
  const r = analisarConsumo(contas);
  assert.equal(r.contasReferencia.length, 6);
  assert.equal(r.nivel, NIVEIS.NORMAL);
});

test('detecta aumento para investigar e explica o motivo', () => {
  const r = analisarConsumo([
    conta('2026-01', 18), conta('2026-02', 18), conta('2026-03', 18), conta('2026-04', 27),
  ]);
  assert.equal(r.nivel, NIVEIS.INVESTIGAR);
  assert.ok(Math.abs(r.variacaoConsumo - 0.5) < 1e-9);
  assert.ok(r.motivos.includes('consumo_por_pessoa_acima'));
});

test('separa aumento de preço do aumento de volume', () => {
  const r = analisarConsumo([
    conta('2026-01', 18, 162), conta('2026-02', 18, 162), conta('2026-03', 18, 162),
    conta('2026-04', 18, 216),
  ]);
  assert.equal(r.nivel, NIVEIS.NORMAL);
  assert.ok(r.motivos.includes('preco_m3_subiu'));
});

test('formata mês e percentual', () => {
  assert.equal(formatarMes('2026-10'), 'out/2026');
  assert.equal(formatarPercentual(0.5), '+50%');
});

import { evolucaoAposMes } from '../src/regras/consumo.js';

test('acompanha a evolução das contas depois da verificação', () => {
  const contas = [conta('2026-09', 18), conta('2026-10', 27), conta('2026-11', 18)];
  const r = evolucaoAposMes(contas, '2026-10');
  assert.equal(r.base.litros, 300);
  assert.equal(r.seguintes.length, 1);
  assert.ok(Math.abs(r.seguintes[0].variacao - -1 / 3) < 1e-9);
  assert.deepEqual(evolucaoAposMes(contas, '2025-01'), { base: null, seguintes: [] });
});
