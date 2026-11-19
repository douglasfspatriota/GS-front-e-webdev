// Hook personalizado: recebe as leituras de vazão e calcula o estado do monitor.
// Modo "simulador": gera leituras no navegador a partir de um controle deslizante.
// Modo "mqtt": assina o tópico em que o ESP32 do Wokwi publica a telemetria.
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  estadoInicialFluxo, processarLeitura, verificarSilencio, lerMensagemTelemetria,
} from '../regras/fluxo.js';

export const BROKER_PADRAO = 'wss://broker.hivemq.com:8884/mqtt';
export const TOPICO_PADRAO = 'gota-alerta/1esr/telemetria';
const MAXIMO_LEITURAS = 60;

export function useTelemetria({ modo, broker = BROKER_PADRAO, topico = TOPICO_PADRAO }) {
  const [monitor, setMonitor] = useState(estadoInicialFluxo);
  const [leituras, setLeituras] = useState([]);
  const [conexao, setConexao] = useState('desconectado');
  const [estadoDispositivo, setEstadoDispositivo] = useState(null);

  // Controles do simulador (equivalem ao potenciômetro e ao botão de falha do Wokwi).
  const [vazaoEmulada, setVazaoEmulada] = useState(0);
  const [falhaSimulada, setFalhaSimulada] = useState(false);
  const controles = useRef({ vazaoEmulada, falhaSimulada });
  controles.current = { vazaoEmulada, falhaSimulada };

  const receber = useCallback((vazao, t = Date.now()) => {
    setMonitor((anterior) => processarLeitura(anterior, { vazao, t }));
    setLeituras((atuais) => [...atuais, { t, vazao }].slice(-MAXIMO_LEITURAS));
  }, []);

  const reiniciar = useCallback(() => {
    setMonitor(estadoInicialFluxo());
    setLeituras([]);
    setEstadoDispositivo(null);
  }, []);

  // Ao trocar de modo, começa do zero.
  useEffect(() => {
    reiniciar();
  }, [modo, reiniciar]);

  // Simulador: uma leitura por segundo, com um pequeno ruído.
  useEffect(() => {
    if (modo !== 'simulador') return undefined;
    setConexao('simulador');
    const id = setInterval(() => {
      const { vazaoEmulada: v, falhaSimulada: falha } = controles.current;
      if (falha) return receber(null);
      const ruido = v > 0 ? (Math.random() - 0.5) * 0.1 * v : 0;
      receber(Math.max(0, v + ruido));
    }, 1000);
    return () => clearInterval(id);
  }, [modo, receber]);

  // MQTT: conecta por WebSocket ao broker e assina o tópico do ESP32.
  useEffect(() => {
    if (modo !== 'mqtt') return undefined;
    let cliente = null;
    let cancelado = false;
    setConexao('conectando');

    import('mqtt').then(({ default: mqtt }) => {
      if (cancelado) return;
      cliente = mqtt.connect(broker, {
        clientId: `gota-alerta-web-${Math.random().toString(16).slice(2, 10)}`,
        reconnectPeriod: 3000,
        connectTimeout: 10000,
      });
      cliente.on('connect', () => {
        setConexao('conectado');
        cliente.subscribe(topico);
      });
      cliente.on('reconnect', () => setConexao('conectando'));
      cliente.on('offline', () => setConexao('desconectado'));
      cliente.on('error', () => setConexao('erro'));
      cliente.on('message', (_topico, mensagem) => {
        const { vazao, estadoDispositivo: estado } = lerMensagemTelemetria(mensagem.toString());
        setEstadoDispositivo(estado);
        receber(vazao);
      });
    }).catch(() => setConexao('erro'));

    return () => {
      cancelado = true;
      cliente?.end(true);
      setConexao('desconectado');
    };
  }, [modo, broker, topico, receber]);

  // Confere a cada segundo se o sensor parou de mandar leituras.
  useEffect(() => {
    const id = setInterval(() => setMonitor((atual) => verificarSilencio(atual, Date.now())), 1000);
    return () => clearInterval(id);
  }, []);

  return {
    monitor,
    leituras,
    conexao,
    estadoDispositivo,
    reiniciar,
    simulador: { vazaoEmulada, setVazaoEmulada, falhaSimulada, setFalhaSimulada },
  };
}
