import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco } from '../servidor/banco.js';
import { criarApp } from '../servidor/app.js';

let servidor;
let base;

before(async () => {
  servidor = criarApp(abrirBanco(':memory:')).listen(0);
  await new Promise((ok) => servidor.once('listening', ok));
  base = `http://localhost:${servidor.address().port}/api`;
});

after(() => servidor.close());

function chamar(caminho, { casa = 'casa-teste-a1', metodo = 'GET', corpo } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (casa) headers['X-Casa-Id'] = casa;
  return fetch(base + caminho, {
    method: metodo,
    headers,
    body: corpo === undefined ? undefined : typeof corpo === 'string' ? corpo : JSON.stringify(corpo),
  });
}

const conta = { mes: '2026-09', volume_m3: 18, valor_reais: 162, dias: 30, moradores: 3 };

test('CRUD completo de contas', async () => {
  let r = await chamar('/contas', { metodo: 'POST', corpo: conta });
  assert.equal(r.status, 201);
  const criada = await r.json();

  r = await chamar(`/contas/${criada.id}`);
  assert.equal((await r.json()).volume_m3, 18);

  r = await chamar(`/contas/${criada.id}`, { metodo: 'PUT', corpo: { ...conta, volume_m3: 20 } });
  assert.equal(r.status, 200);
  assert.equal((await r.json()).volume_m3, 20);

  r = await chamar('/contas', { metodo: 'POST', corpo: conta });
  assert.equal(r.status, 409);

  r = await chamar('/contas', { metodo: 'POST', corpo: { ...conta, mes: '2026-08', dias: 0 } });
  assert.equal(r.status, 422);
  assert.ok((await r.json()).erros.dias);

  r = await chamar(`/contas/${criada.id}`, { metodo: 'DELETE' });
  assert.equal(r.status, 204);
  r = await chamar(`/contas/${criada.id}`);
  assert.equal(r.status, 404);
});

test('CRUD completo de verificações', async () => {
  let r = await chamar('/verificacoes', {
    metodo: 'POST',
    corpo: { conta_mes: '2026-10', respostas: { ruido: 'sim' }, hipotese: 'Possível vazamento' },
  });
  assert.equal(r.status, 201);
  const criada = await r.json();
  assert.equal(criada.desfecho, 'pendente');
  assert.deepEqual(criada.respostas, { ruido: 'sim' });

  r = await chamar(`/verificacoes/${criada.id}`, { metodo: 'PUT', corpo: { desfecho: 'reparado', anotacao: 'Troquei a boia' } });
  assert.equal((await r.json()).desfecho, 'reparado');

  r = await chamar(`/verificacoes/${criada.id}`, { metodo: 'PUT', corpo: { desfecho: 'qualquer' } });
  assert.equal(r.status, 422);

  r = await chamar('/verificacoes');
  assert.equal((await r.json()).length, 1);

  r = await chamar(`/verificacoes/${criada.id}`, { metodo: 'DELETE' });
  assert.equal(r.status, 204);
});

test('cada casa só enxerga os próprios dados', async () => {
  const r = await chamar('/contas', { casa: 'casa-teste-b2', metodo: 'POST', corpo: { ...conta, mes: '2026-07' } });
  const criada = await r.json();
  assert.equal((await chamar(`/contas/${criada.id}`, { casa: 'casa-teste-c3' })).status, 404);
  assert.deepEqual(await (await chamar('/contas', { casa: 'casa-teste-c3' })).json(), []);
});

test('recusa cabeçalho ausente e JSON inválido', async () => {
  assert.equal((await chamar('/contas', { casa: null })).status, 400);
  const r = await chamar('/contas', { metodo: 'POST', corpo: '{ quebrado' });
  assert.equal(r.status, 400);
  assert.match((await r.json()).erro, /JSON/);
});
