import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validarConta, mesJaCadastrado } from '../src/regras/validacao.js';

const hoje = new Date(2026, 10, 19); // 19/11/2026
const valida = { mes: '2026-10', volume_m3: 19, valor_reais: 171, dias: 31, moradores: 3 };

test('aceita uma conta válida e normaliza os números', () => {
  const r = validarConta({ ...valida, volume_m3: '19,5', dias: '31' }, { hoje });
  assert.equal(r.valido, true);
  assert.deepEqual(r.conta, { ...valida, volume_m3: 19.5 });
});

test('aponta cada campo inválido com mensagem', () => {
  const r = validarConta({ mes: '10/2026', volume_m3: 0, valor_reais: -1, dias: 1.5, moradores: 0 }, { hoje });
  assert.equal(r.valido, false);
  assert.deepEqual(Object.keys(r.erros).sort(), ['dias', 'mes', 'moradores', 'valor_reais', 'volume_m3']);
  assert.equal(r.conta, null);
});

test('recusa mês no futuro e volume absurdo', () => {
  const r = validarConta({ ...valida, mes: '2026-12', volume_m3: 5000 }, { hoje });
  assert.match(r.erros.mes, /futuro/);
  assert.match(r.erros.volume_m3, /alto demais/);
});

test('detecta mês repetido, ignorando a própria conta na edição', () => {
  const contas = [{ id: 1, mes: '2026-10' }, { id: 2, mes: '2026-09' }];
  assert.equal(mesJaCadastrado(contas, '2026-10'), true);
  assert.equal(mesJaCadastrado(contas, '2026-10', 1), false);
  assert.equal(mesJaCadastrado(contas, '2026-08'), false);
});
