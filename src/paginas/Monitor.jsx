import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import TituloPagina from '../componentes/TituloPagina.jsx';
import PainelFluxo, { INFO_ESTADOS } from '../componentes/PainelFluxo.jsx';
import Aviso from '../componentes/Aviso.jsx';
import Botao from '../componentes/Botao.jsx';
import { useTelemetria, BROKER_PADRAO, TOPICO_PADRAO } from '../hooks/useTelemetria.js';
import { formatarNumero } from '../regras/formatos.js';

const TEXTO_CONEXAO = {
  simulador: 'Simulador no navegador',
  conectando: 'Conectando ao broker MQTT…',
  conectado: 'Conectado: aguardando leituras do ESP32',
  desconectado: 'Desconectado',
  erro: 'Erro na conexão MQTT',
};

export default function Monitor() {
  const [modo, setModo] = useState('simulador');
  const { monitor, leituras, conexao, estadoDispositivo, reiniciar, simulador } = useTelemetria({ modo });

  return (
    <div className="space-y-6">
      <TituloPagina
        titulo="Monitor de fluxo"
        descricao="Um ESP32 no hidrômetro avisa quando a água corre sem pausa, o sinal típico de vazamento. No protótipo, a vazão é emulada por um potenciômetro no Wokwi ou pelo simulador abaixo."
      />

      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="mb-2 font-semibold">Fonte das leituras</legend>
        {[
          ['simulador', 'Simulador no navegador'],
          ['mqtt', 'ESP32 no Wokwi (MQTT)'],
        ].map(([valor, rotulo]) => (
          <label
            key={valor}
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 has-checked:border-agua-700 has-checked:bg-agua-50 has-checked:font-bold has-focus-visible:outline-3 has-focus-visible:outline-agua-600"
          >
            <input type="radio" name="modo" value={valor} checked={modo === valor} onChange={() => setModo(valor)} className="size-4 accent-agua-700" />
            {rotulo}
          </label>
        ))}
        <Botao variante="fantasma" icone={RotateCcw} onClick={reiniciar}>Reiniciar</Botao>
      </fieldset>

      <p className="text-sm text-slate-700" role="status">
        <strong>Conexão:</strong> {TEXTO_CONEXAO[conexao]}
        {modo === 'mqtt' && estadoDispositivo && INFO_ESTADOS[estadoDispositivo] && (
          <> · estado informado pelo ESP32: <strong>{INFO_ESTADOS[estadoDispositivo].rotulo}</strong></>
        )}
      </p>

      {modo === 'simulador' ? (
        <div className="space-y-3 rounded-2xl border border-agua-100 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-agua-900">Controles do simulador</h2>
          <div className="space-y-1">
            <label htmlFor="vazao" className="font-semibold">
              Vazão emulada: <span className="font-mono">{formatarNumero(simulador.vazaoEmulada, 1)} L/min</span>
            </label>
            <input
              id="vazao"
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={simulador.vazaoEmulada}
              onChange={(e) => simulador.setVazaoEmulada(Number(e.target.value))}
              className="w-full accent-agua-700"
            />
            <p className="text-sm text-slate-600">Equivale ao potenciômetro do Wokwi. Deixe acima de zero por mais de 10 s para ver o alerta.</p>
          </div>
          <label className="flex min-h-11 items-center gap-2">
            <input
              type="checkbox"
              checked={simulador.falhaSimulada}
              onChange={(e) => simulador.setFalhaSimulada(e.target.checked)}
              className="size-5 accent-agua-700"
            />
            Simular falha de leitura (equivale ao botão do Wokwi)
          </label>
        </div>
      ) : (
        <Aviso tipo="info" titulo="Como conectar o ESP32">
          Abra o projeto no Wokwi e inicie a simulação. O ESP32 publica em <code className="font-mono">{TOPICO_PADRAO}</code>{' '}
          no broker público <code className="font-mono">{BROKER_PADRAO.replace('wss://', '').replace('/mqtt', '')}</code> mensagens como{' '}
          <code className="font-mono">{'{"vazao_lpm": 0.42, "estado": "normal"}'}</code>. O broker é de testes: qualquer
          pessoa pode ler o tópico, por isso só circulam dados sintéticos.
        </Aviso>
      )}

      <PainelFluxo monitor={monitor} leituras={leituras} />

      <p className="text-sm text-slate-600">
        Os tempos de alerta estão encurtados para a demonstração (10 s e 30 s). O potenciômetro não mede água: ele só
        emula o sinal de um sensor de vazão. O monitor não corta o abastecimento.
      </p>
    </div>
  );
}
