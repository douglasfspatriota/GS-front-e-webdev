// Regras do monitor de fluxo, as mesmas do firmware do ESP32 no Wokwi.
// Ideia: vazamentos costumam gerar fluxo SEM PAUSA. Uso normal liga e desliga.
// Os tempos estão encurtados (segundos) para a demonstração; numa casa real seriam minutos ou horas.

export const CONFIG_FLUXO = {
  limiarFluxo: 0.1, // L/min: abaixo disso consideramos "sem fluxo"
  segundosAtencao: 10, // fluxo contínuo por 10 s: atenção
  segundosSuspeita: 30, // fluxo contínuo por 30 s: suspeita
  vazaoMaxima: 30, // L/min: acima disso a leitura é considerada inválida
  alfa: 0.3, // suavização exponencial (0 a 1): quanto maior, mais rápida
  segundosSemLeitura: 10, // sem leitura por 10 s: sensor inválido
};

export const ESTADOS_FLUXO = {
  NORMAL: 'normal',
  ATENCAO: 'atencao',
  SUSPEITA: 'suspeita',
  SENSOR_INVALIDO: 'sensor_invalido',
};

export function leituraValida(vazao, config = CONFIG_FLUXO) {
  return typeof vazao === 'number' && Number.isFinite(vazao) && vazao >= 0 && vazao <= config.vazaoMaxima;
}

export function estadoInicialFluxo() {
  return { estado: ESTADOS_FLUXO.NORMAL, suavizada: 0, inicioFluxo: null, segundosContinuos: 0, ultimaLeitura: null };
}

// Recebe o estado anterior e uma leitura { vazao (L/min), t (ms) } e devolve o novo estado.
export function processarLeitura(anterior, { vazao, t }, config = CONFIG_FLUXO) {
  if (!leituraValida(vazao, config)) {
    return { ...anterior, estado: ESTADOS_FLUXO.SENSOR_INVALIDO, inicioFluxo: null, segundosContinuos: 0, ultimaLeitura: t };
  }

  const suavizada = config.alfa * vazao + (1 - config.alfa) * anterior.suavizada;

  if (suavizada < config.limiarFluxo) {
    return { estado: ESTADOS_FLUXO.NORMAL, suavizada, inicioFluxo: null, segundosContinuos: 0, ultimaLeitura: t };
  }

  const inicioFluxo = anterior.inicioFluxo ?? t;
  const segundosContinuos = (t - inicioFluxo) / 1000;
  let estado = ESTADOS_FLUXO.NORMAL;
  if (segundosContinuos >= config.segundosSuspeita) estado = ESTADOS_FLUXO.SUSPEITA;
  else if (segundosContinuos >= config.segundosAtencao) estado = ESTADOS_FLUXO.ATENCAO;

  return { estado, suavizada, inicioFluxo, segundosContinuos, ultimaLeitura: t };
}

// Sem leituras recentes, o sensor é considerado inválido.
export function verificarSilencio(atual, agora, config = CONFIG_FLUXO) {
  if (atual.ultimaLeitura === null) return atual;
  if ((agora - atual.ultimaLeitura) / 1000 < config.segundosSemLeitura) return atual;
  if (atual.estado === ESTADOS_FLUXO.SENSOR_INVALIDO) return atual;
  return { ...atual, estado: ESTADOS_FLUXO.SENSOR_INVALIDO, inicioFluxo: null, segundosContinuos: 0 };
}

// Lê a mensagem MQTT do ESP32: {"vazao_lpm": 0.42, "falha": false}
export function lerMensagemTelemetria(texto) {
  try {
    const dados = JSON.parse(texto);
    if (dados.falha === true) return { vazao: null, estadoDispositivo: dados.estado ?? null };
    return { vazao: Number(dados.vazao_lpm), estadoDispositivo: dados.estado ?? null };
  } catch {
    return { vazao: null, estadoDispositivo: null };
  }
}
