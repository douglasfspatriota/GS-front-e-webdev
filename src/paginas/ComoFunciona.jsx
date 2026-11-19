import { useState } from 'react';
import { Eraser } from 'lucide-react';
import TituloPagina from '../componentes/TituloPagina.jsx';
import DialogoConfirmacao from '../componentes/DialogoConfirmacao.jsx';
import Aviso from '../componentes/Aviso.jsx';
import Botao from '../componentes/Botao.jsx';
import { useDados } from '../contexto/DadosContexto.jsx';
import { novaCasa } from '../servicos/casa.js';
import {
  LIMITE_ATENCAO, LIMITE_INVESTIGAR, MINIMO_CONTAS_REFERENCIA, MAXIMO_CONTAS_REFERENCIA,
} from '../regras/consumo.js';
import { CONFIG_FLUXO } from '../regras/fluxo.js';

function Secao({ titulo, children }) {
  return (
    <section className="space-y-3 rounded-2xl border border-agua-100 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-agua-900">{titulo}</h2>
      <div className="space-y-3 leading-relaxed text-slate-800">{children}</div>
    </section>
  );
}

export default function ComoFunciona() {
  const { contas, verificacoes } = useDados();
  const [confirmando, setConfirmando] = useState(false);
  const [recomecou, setRecomecou] = useState(false);

  async function comecarDoZero() {
    novaCasa();
    setConfirmando(false);
    await Promise.all([contas.recarregar(), verificacoes.recarregar()]);
    setRecomecou(true);
  }

  return (
    <div className="space-y-6">
      <TituloPagina
        titulo="Como funciona"
        descricao="O que o Gota Alerta calcula, o que ele não consegue afirmar e como seus dados são tratados."
      />

      <Secao titulo="1. Comparar a casa com ela mesma">
        <p>
          O valor da conta muda com a tarifa e o volume muda com o número de pessoas e os dias do período. Por isso,
          cada conta é transformada em <strong>litros por pessoa por dia</strong>:
        </p>
        <p className="rounded-xl bg-agua-50 p-4 text-center font-mono text-lg font-bold text-agua-900">
          volume (m³) × 1.000 ÷ dias ÷ moradores
        </p>
        <p>
          A conta mais recente é comparada com a média das até {MAXIMO_CONTAS_REFERENCIA} contas anteriores. São
          necessárias pelo menos {MINIMO_CONTAS_REFERENCIA} contas anteriores para haver referência.
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Aumento a partir de {LIMITE_ATENCAO * 100}%: <strong>atenção</strong>.</li>
          <li>Aumento a partir de {LIMITE_INVESTIGAR * 100}%: <strong>investigar aumento</strong>.</li>
          <li>O valor em reais é analisado à parte, pelo preço médio do m³, para separar reajuste de tarifa de aumento de consumo.</li>
        </ul>
        <p className="text-sm text-slate-600">
          Os limites de 20% e 50% são hipóteses didáticas do protótipo e ainda não foram validados em campo. Não usamos
          média do bairro: ainda não existe uma referência validada para Aclimação e Cambuci.
        </p>
      </Secao>

      <Secao titulo="2. Investigar e registrar">
        <p>
          Quando aparece um aumento, um questionário de 7 perguntas separa mudanças de uso (visitas, obras, rotina) de
          sinais de vazamento (umidade, barulho de água, descarga escorrendo e o teste do hidrômetro com tudo fechado).
          O resultado é uma <strong>hipótese</strong> com próximos passos, não um diagnóstico.
        </p>
        <p>
          O morador registra o que verificou e o desfecho (consumo explicado, reparo realizado ou causa não encontrada).
          As contas seguintes mostram se o consumo voltou ao normal.
        </p>
      </Secao>

      <Secao titulo="3. Monitor de fluxo com ESP32">
        <p>
          Vazamentos costumam gerar fluxo de água sem pausa. O ESP32 suaviza as leituras e muda de estado quando a água
          corre sem parar: atenção depois de {CONFIG_FLUXO.segundosAtencao} s e suspeita depois de{' '}
          {CONFIG_FLUXO.segundosSuspeita} s (tempos encurtados para a demonstração). Leituras impossíveis ou ausentes
          viram “sensor inválido”.
        </p>
        <p>
          No protótipo, um potenciômetro no Wokwi emula o sensor e a telemetria sintética chega por MQTT. O
          enchimento da caixa-d’água e usos longos legítimos também geram fluxo contínuo e precisam ser considerados.
        </p>
      </Secao>

      <Secao titulo="Limites do sistema">
        <ul className="list-disc space-y-1 pl-6">
          <li>Uma conta alta não comprova vazamento.</li>
          <li>Um medidor geral não mostra em qual cômodo está o desperdício. A localização depende de inspeção ou de sensores adicionais.</li>
          <li>Esta versão não corta o abastecimento automaticamente.</li>
          <li>Os dados de demonstração são fictícios, e não houve medição de economia real.</li>
        </ul>
      </Secao>

      <Secao titulo="Privacidade">
        <p>
          O Gota Alerta não pede nome, e-mail nem endereço. Este navegador gera um identificador anônimo da casa, que
          separa os seus dados dos de outras casas no servidor. Quem tiver acesso a este navegador vê os mesmos dados.
        </p>
        {recomecou && <Aviso tipo="sucesso" titulo="Pronto: este navegador começou uma casa nova, sem contas." />}
        <Botao variante="secundario" icone={Eraser} onClick={() => setConfirmando(true)}>
          Começar do zero neste navegador
        </Botao>
      </Secao>

      <Secao titulo="Objetivos de Desenvolvimento Sustentável">
        <p>
          <strong>ODS 6, meta 6.4:</strong> aumentar a eficiência no uso da água. <strong>ODS 12, meta 12.2:</strong>{' '}
          uso eficiente dos recursos naturais.
        </p>
      </Secao>

      <DialogoConfirmacao
        aberto={confirmando}
        titulo="Começar do zero?"
        textoConfirmar="Começar do zero"
        onConfirmar={comecarDoZero}
        onCancelar={() => setConfirmando(false)}
      >
        <p>
          Este navegador vai gerar um novo identificador de casa. As contas e verificações atuais deixam de aparecer
          aqui.
        </p>
      </DialogoConfirmacao>
    </div>
  );
}
