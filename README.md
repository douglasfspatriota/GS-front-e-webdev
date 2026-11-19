# Gota Alerta

## Ficha da CitizenTech

| | |
|---|---|
| **Nome da CitizenTech** | Gota Alerta |
| **Cidade e bairro** | São Paulo (SP), Aclimação e Cambuci |
| **Cidadão** | Morador de casa que recebe uma conta de água mais alta e não sabe o motivo |
| **Problema em uma frase** | O morador percebe que a conta subiu, mas não sabe se foi mudança de hábito, mais gente em casa, vazamento oculto, tarifa ou erro de leitura, e muitas vezes só investiga depois da cobrança. |
| **Como funciona** | O morador cadastra as contas, o sistema transforma cada uma em litros por pessoa por dia, compara com o histórico da própria casa, explica o aumento, aplica um questionário de investigação e registra as verificações. Um monitor com ESP32 (simulado) avisa quando há fluxo de água sem pausa. |
| **O que cada parte faz** | **Aplicação web (este repositório):** cadastro, análise, investigação, verificações e painel do monitor. **API REST:** guarda contas e verificações em banco de dados. **ESP32 no Wokwi:** emula o fluxo com um potenciômetro, decide o estado e publica telemetria por MQTT. **Aplicação Python:** versão de terminal das mesmas regras. **Modelo matemático:** mostra quanto uma pequena perda acumula. |
| **Repositório** | [PREENCHER: link do repositório no GitHub] |
| **Deploy** | [PREENCHER: link do deploy] |
| **Indicador de impacto** | Proporção de alertas "investigar aumento" que terminam com desfecho registrado (consumo explicado ou reparo realizado) e variação do consumo por pessoa por dia nas contas seguintes. Ainda não medido: o protótipo usa dados fictícios. |
| **ODS** | ODS 6, meta 6.4 (eficiência no uso da água) e ODS 12, meta 12.2 (uso eficiente dos recursos naturais) |

**Equipe (turma 1ESR):** Octavio Kal Oliveira Lima (RM571838), Vitor Santos Cintra (RM569416), Guilherme Zeferino Gonçalves (RM572075), Douglas Ferreira Santos Patriota (RM569713), Pedro Henrique Santos de Brito (RM573187).

FIAP · Global Solution CitizenTech · 2º semestre de 2026 · Engenharia de Software · Disciplinas: Front-end Design e Web Development.

---

## O que a aplicação faz

| Tela | Função |
|---|---|
| Minha conta | Visor no estilo do hidrômetro com o consumo da conta mais recente, nível do alerta, gráfico mês a mês e explicação com os números usados |
| Histórico | Cadastro, edição e exclusão de contas, com validação e prévia do consumo por pessoa por dia |
| Investigar | Questionário de 7 perguntas, hipótese e próximos passos; registra a verificação |
| Verificações | Lista as verificações, atualiza o desfecho e mostra a evolução das contas seguintes |
| Monitor de fluxo | Recebe a telemetria do ESP32 por MQTT ou usa um simulador no navegador com as mesmas regras |
| Como funciona | Regras, limites do sistema, privacidade e ODS |

### Regras de análise

- Litros por pessoa por dia = volume em m³ × 1.000 ÷ dias ÷ moradores.
- Referência: média das até 6 contas anteriores, com no mínimo 3.
- A partir de 20% de aumento: atenção. A partir de 50%: investigar aumento.
- Valor em reais e volume são analisados separadamente (preço médio por m³).

Os limites são hipóteses didáticas do protótipo, sem validação em campo. Uma conta alta não comprova vazamento.

## Tecnologias

- React 19 com Vite 8 e Tailwind CSS 4
- React Router para as páginas
- API REST própria com Express 5 e SQLite (`node:sqlite`, embutido no Node)
- MQTT.js por WebSocket para a telemetria do ESP32
- Ícones Lucide e fonte Atkinson Hyperlegible
- Testes com o executor nativo do Node (`node --test`)

## Pré-requisitos

- **Node.js 22.22 ou superior** (recomendado: 24). O SQLite usado já vem com o Node.
- npm (vem com o Node).

## Como instalar e executar

```bash
npm install
npm run dev
```

Abra http://localhost:5173. O comando sobe a API em http://localhost:3001 e a interface ao mesmo tempo. Na primeira tela, clique em **Ver com dados de demonstração** para carregar sete contas fictícias.

| Comando | O que faz |
|---|---|
| `npm run dev` | API e interface em modo de desenvolvimento |
| `npm test` | Roda os 25 testes das regras e da API |
| `npm run build` | Gera a versão de produção na pasta `dist` |
| `npm start` | Serve a pasta `dist` e a API juntas, em http://localhost:3001 (rode `npm run build` antes) |

O banco local fica em `servidor/dados/gota-alerta.db`, criado automaticamente.

## Deploy (Render)

O arquivo `render.yaml` configura um serviço Node que compila o site e serve site e API juntos.

1. Envie o repositório para o GitHub.
2. No Render, escolha **New > Blueprint** e selecione o repositório (ou **New > Web Service** com build `npm ci --include=dev && npm run build` e start `npm start`).
3. Aguarde o build e abra o endereço gerado.

No plano gratuito do Render o disco não é permanente: o banco SQLite é recriado quando o serviço reinicia. Para a demonstração isso é suficiente, já que os dados são fictícios e o botão de demonstração recria as contas.

## API REST

Todas as rotas (exceto `/api/saude`) exigem o cabeçalho `X-Casa-Id`, um identificador anônimo gerado no navegador. Ele separa os dados de cada casa sem pedir nome, e-mail ou endereço.

| Método | Rota | Descrição | Respostas |
|---|---|---|---|
| GET | `/api/saude` | Verifica se a API está no ar | 200 |
| GET | `/api/contas` | Lista as contas | 200 |
| GET | `/api/contas/:id` | Busca uma conta | 200, 404 |
| POST | `/api/contas` | Cadastra uma conta | 201, 409 (mês repetido), 422 (dados inválidos) |
| PUT | `/api/contas/:id` | Atualiza uma conta | 200, 404, 409, 422 |
| DELETE | `/api/contas/:id` | Exclui uma conta | 204, 404 |
| GET | `/api/verificacoes` | Lista as verificações | 200 |
| POST | `/api/verificacoes` | Registra uma verificação | 201, 422 |
| PUT | `/api/verificacoes/:id` | Atualiza desfecho e anotação | 200, 404, 422 |
| DELETE | `/api/verificacoes/:id` | Exclui uma verificação | 204, 404 |

Cabeçalho ausente ou inválido e JSON malformado respondem 400.

Exemplo de conta:

```json
{ "mes": "2026-10", "volume_m3": 19, "valor_reais": 171, "dias": 31, "moradores": 3 }
```

Exemplo de verificação:

```json
{ "conta_mes": "2026-10", "respostas": { "hidrometro": "sim" }, "hipotese": "Indício forte de vazamento", "desfecho": "pendente" }
```

## Organização do código

A interface, as regras de negócio e o acesso aos dados ficam separados:

```
src/
  regras/        regras de negócio puras (sem React, sem fetch): consumo, validação,
                 verificação, investigação, fluxo e formatos; usadas também pela API
  servicos/      acesso aos dados: único lugar que chama a API HTTP (api.js) e
                 identificador anônimo da casa (casa.js)
  hooks/         hooks personalizados: useContas, useVerificacoes, useTelemetria
  contexto/      compartilha contas e verificações entre as páginas
  componentes/   componentes reutilizáveis de interface
  paginas/       telas da aplicação
  dados/         contas fictícias de demonstração
servidor/        API (Express + SQLite): app, banco, repositórios e rotas
testes/          testes das regras e da API
```

### Componentes reutilizáveis (17)

`Aviso`, `Botao`, `Cabecalho`, `Campo`, `CartaoVerificacao`, `DialogoConfirmacao`, `ExplicacaoAnalise`, `FormularioConta`, `GraficoConsumo`, `Layout`, `PainelFluxo`, `Questionario`, `Rodape`, `SeloNivel`, `TabelaContas`, `TituloPagina`, `VisorHidrometro`.

### Hooks

- `useState` e `useEffect` em formulários, páginas, componentes e hooks.
- `useContas`: carrega as contas, oferece o CRUD e entrega a análise e o histórico prontos.
- `useVerificacoes`: CRUD das verificações.
- `useTelemetria`: assina o tópico MQTT do ESP32 ou gera leituras no simulador do navegador, e calcula o estado do monitor.

### Monitor e ESP32

O ESP32 no Wokwi publica no broker público `broker.hivemq.com`, tópico `gota-alerta/1esr/telemetria`, mensagens como:

```json
{ "vazao_lpm": 0.42, "estado": "normal" }
```

Uma falha de leitura é enviada como `{ "falha": true }`. O painel aplica as mesmas regras do firmware (`src/regras/fluxo.js`): atenção após 10 s de fluxo sem pausa e suspeita após 30 s (tempos encurtados para a demonstração).

## Acessibilidade e design

- Fonte Atkinson Hyperlegible, desenhada para leitura por pessoas com baixa visão. A versão mono imita os números do hidrômetro.
- Nível do alerta sempre com texto e ícone, não só com cor.
- Navegação por teclado, foco visível, link "Pular para o conteúdo", foco levado ao conteúdo ao trocar de página e título da aba por página.
- Gráfico com detalhes por foco, rótulos ligados aos campos, erros anunciados e respeito a "reduzir movimento".
- Layout responsivo do celular ao computador.

## Limites desta versão

- Uma conta alta não comprova vazamento, e o sistema não localiza vazamentos.
- Não há comparação com médias do bairro: ainda não existe média validada para Aclimação e Cambuci.
- O monitor usa um potenciômetro no Wokwi para emular a vazão e um broker MQTT público de testes.
- Não há corte automático do abastecimento.
- Os dados de demonstração são fictícios e não houve medição de economia real.

## Uso de IA

Ver [AI.md](AI.md).
