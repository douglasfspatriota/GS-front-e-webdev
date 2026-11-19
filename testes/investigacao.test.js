import { test } from 'node:test';
import assert from 'node:assert/strict';
import { avaliarRespostas, questionarioCompleto, PERGUNTAS } from '../src/regras/investigacao.js';

const todas = (valor) => Object.fromEntries(PERGUNTAS.map((p) => [p.id, valor]));

test('hidrômetro girando com tudo fechado indica vazamento provável', () => {
  const r = avaliarRespostas({ ...todas('nao'), hidrometro: 'sim' });
  assert.equal(r.tipo, 'vazamento_provavel');
  assert.ok(r.passos.some((p) => p.includes('registro geral')));
});

test('só mudanças de uso explicam o aumento', () => {
  const r = avaliarRespostas({ ...todas('nao'), visitas: 'sim' });
  assert.equal(r.tipo, 'uso_explicado');
});

test('uso e sinais juntos resultam em hipótese mista', () => {
  const r = avaliarRespostas({ ...todas('nao'), obras: 'sim', umidade: 'sim' });
  assert.equal(r.tipo, 'misto');
});

test('sem sinais sugere conferir leitura e tarifa e fazer o teste do hidrômetro', () => {
  const r = avaliarRespostas(todas('nao_sei'));
  assert.equal(r.tipo, 'indefinido');
  assert.ok(r.passos.some((p) => p.includes('leitura')));
  assert.ok(r.passos.some((p) => p.includes('teste do hidrômetro')));
});

test('questionário só fica completo com todas as respostas válidas', () => {
  assert.equal(questionarioCompleto(todas('sim')), true);
  assert.equal(questionarioCompleto({ ...todas('sim'), ruido: undefined }), false);
  assert.equal(questionarioCompleto({ ...todas('sim'), ruido: 'talvez' }), false);
});
