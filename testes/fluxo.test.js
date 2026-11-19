import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  processarLeitura, estadoInicialFluxo, verificarSilencio, lerMensagemTelemetria, ESTADOS_FLUXO,
} from '../src/regras/fluxo.js';

function simular(vazoes) {
  let estado = estadoInicialFluxo();
  vazoes.forEach((vazao, i) => {
    estado = processarLeitura(estado, { vazao, t: i * 1000 });
  });
  return estado;
}

test('fluxo contínuo passa de normal para atenção e suspeita', () => {
  assert.equal(simular(Array(5).fill(1)).estado, ESTADOS_FLUXO.NORMAL);
  assert.equal(simular(Array(15).fill(1)).estado, ESTADOS_FLUXO.ATENCAO);
  assert.equal(simular(Array(40).fill(1)).estado, ESTADOS_FLUXO.SUSPEITA);
});

test('uma pausa no uso zera a contagem de fluxo contínuo', () => {
  const r = simular([...Array(15).fill(1), ...Array(10).fill(0), ...Array(3).fill(1)]);
  assert.equal(r.estado, ESTADOS_FLUXO.NORMAL);
});

test('leitura inválida ou silêncio do sensor viram sensor inválido', () => {
  assert.equal(simular([1, 1, -5]).estado, ESTADOS_FLUXO.SENSOR_INVALIDO);
  assert.equal(simular([1, NaN]).estado, ESTADOS_FLUXO.SENSOR_INVALIDO);
  const r = verificarSilencio(simular([0, 0]), 20000);
  assert.equal(r.estado, ESTADOS_FLUXO.SENSOR_INVALIDO);
});

test('lê a mensagem MQTT do ESP32', () => {
  assert.deepEqual(lerMensagemTelemetria('{"vazao_lpm":0.4,"estado":"normal"}'), { vazao: 0.4, estadoDispositivo: 'normal' });
  assert.equal(lerMensagemTelemetria('{"falha":true}').vazao, null);
  assert.equal(lerMensagemTelemetria('quebrado').vazao, null);
});
