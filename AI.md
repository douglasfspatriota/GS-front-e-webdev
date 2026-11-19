# AI.md · Uso de Inteligência Artificial — Gota Alerta (aplicação web)

Global Solution CitizenTech · FIAP · 2º semestre de 2026 · Turma 1ESR

> **Nota:** Este documento registra como a Inteligência Artificial foi utilizada como ferramenta de apoio técnico, revisão de código e aprendizado ao longo do desenvolvimento do projeto pela equipe.

## 1. Ferramentas de IA utilizadas e finalidades

| Ferramenta | Finalidade |
|---|---|
| **Claude (Anthropic)**, aplicativo web (19/11/2026) | Apoio na revisão do escopo do projeto em relação aos requisitos do edital do Global Solution, validação das regras de negócio e estruturação inicial da documentação. |
| **Claude Code (Anthropic)**, extensão no VS Code (19/11/2026) | Apoio na depuração de erros de integração, revisão de trechos de código (React, Express e SQLite), auxílio na escrita de casos de teste automatizados e configuração de deploy. |
| **Assistentes de IA (revisão e estudos da equipe)** | Apoio pontual da equipe para tirar dúvidas sobre o funcionamento de hooks no React, comportamento de rotas na API, leitura de logs de erro e ajustes de layout responsivo. |

## 2. Interações realizadas (prompts e fluxo de trabalho)

### Sessão 1 — Validação de Escopo e Arquitetura (16/11/2026)

A equipe apresentou o documento de concepção do projeto (definição de território, problema, regras de análise de consumo, limites de 20% e 50% e integração entre disciplinas) e utilizou a IA para cruzar essas definições com os critérios de avaliação do desafio. A ferramenta auxiliou na identificação de pontos de atenção técnicos — como a necessidade de separar variações de tarifa de aumentos reais de consumo — e na organização da estrutura inicial de pastas.

### Sessão 2 — Revisão Modular e Depuração (19/11/2026)

Para manter o controle de versão organizado e acompanhar a evolução do código passo a passo no Git, a equipe conduziu o desenvolvimento em 15 entregas incrementais, acionando a IA em momentos pontuais para revisar a estrutura dos módulos, corrigir bugs de integração e validar testes antes dos commits.

**Decisões técnicas tomadas pela equipe com apoio da IA:**
* **Arquitetura da API:** Diante das opções de usar um serviço mockado externo (MockAPI.io) ou construir um back-end próprio, a equipe optou por desenvolver uma API REST em **Node.js com Express e SQLite**, garantindo maior controle sobre as regras de negócio e aprendizado prático de persistência de dados.
* **Estratégia de Deploy:** A equipe optou por consolidar o front-end e o back-end em um único serviço Node no **Render**, simplificando a infraestrutura e reduzindo pontos de falha para a apresentação.

| Etapa | Foco do desenvolvimento e apoio pontual da IA |
|---|---|
| 1 a 3 | Configuração do ambiente (Vite + React + Tailwind), revisão das regras de cálculo de consumo (litros/pessoa/dia) e validação de entradas. |
| 4 a 6 | Apoio na depuração da API REST (Express + SQLite), isolamento de dados via cabeçalho `X-Casa-Id`, tratamento de erros e integração no front-end (`api.js` e hooks). |
| 7 a 10 | Revisão de componentes da interface, navegação, telas de Histórico e Minha Conta, além de ajustes no gráfico de consumo em SVG. |
| 11 a 13 | Validação da lógica do questionário investigativo, registro de verificações e integração do monitor de telemetria (simulador local e suporte a MQTT). |
| 14 e 15 | Revisão de acessibilidade (foco e títulos dinâmicos), documentação técnica e preparação do ambiente de produção (`npm start`). |

**Outras interações da equipe durante o desenvolvimento:**
* A equipe solicitou explicações sobre boas práticas para isolar os dados por residência (`X-Casa-Id`) e para alternar o hook `useTelemetria` entre o simulador local e o broker MQTT, garantindo que todos os integrantes dominassem o funcionamento técnico na apresentação.
* Durante os testes de integração, a equipe pediu apoio para revisar mensagens de validação de formulário e ajustar comportamentos visuais em telas menores.

## 3. Aplicação e divisão de responsabilidades no projeto

O uso da IA foi pautado pela colaboração: a equipe definiu a arquitetura, as regras de domínio e conduziu a implementação, utilizando a IA como suporte para revisar trechos específicos, acelerar testes e resolver gargalos técnicos.

* **Concepção e Regras de Negócio (Equipe):** Definição do problema hídrico, métricas de litros por pessoa/dia, faixas de alerta (20% e 50%), critérios de referência (3 a 6 contas), elaboração das perguntas do questionário investigativo e escolha da stack tecnológica.
* **Sugestões técnicas da IA avaliadas e adotadas pela equipe:**
  * Uso do cabeçalho `X-Casa-Id` para isolar dados de diferentes residências sem exigir um fluxo complexo de autenticação.
  * Adoção da fonte *Atkinson Hyperlegible* e visor estilo hidrômetro para reforçar a acessibilidade e clareza visual.
  * Criação de alerta distinto para aumento de tarifa (R$/m³) sem aumento de volume consumido.
  * Inclusão de um modo "simulador" no painel de telemetria para garantir a demonstração da interface mesmo sem conexão ativa com o hardware no Wokwi.
* **Ajustes e revisões feitas pela equipe:**
  * A equipe revisou os textos das telas, conferiu a coerência das regras de consumo com o escopo do projeto, validou o fluxo de navegação entre as páginas e organizou os commits do repositório a cada entrega concluída.

## 4. Validação e Testes

### 4.1 Apoio na automação de testes

Com o auxílio da IA, a equipe estruturou uma suíte de 25 testes automatizados (`npm test`) e validações de build (`npm run build`) executadas a cada etapa para garantir que novas implementações não quebrassem regras anteriores (cálculos de média, validação de formulários, rotas da API e isolamento de dados). Durante esse processo, a equipe identificou e corrigiu falhas de leitura de números decimais nos formulários e ajustou a legibilidade dos rótulos do gráfico em telas menores.

### 4.2 Validação prática realizada pela equipe

A equipe realizou os testes funcionais e de integração no ambiente local, no navegador e nos fluxos da aplicação:

| Fluxo testado e validado | Resultado / Ajustes |
|---|---|
| Execução local (`npm install`, `npm run dev` e `npm test`), cadastro com erro proposital, edição e exclusão de contas. | Aprovado; validação de campos e atualização da lista conferidos pela equipe. |
| Questionário de investigação, registro e atualização de verificações e evolução das contas seguintes. | Aprovado; desfecho e cálculos conferidos conforme as regras da aplicação. |
| Monitor de fluxo (simulador e MQTT com ESP32 no Wokwi), navegação por teclado, layout mobile e build/deploy no Render. | Aprovado; fluxos revisados pela equipe para a demonstração. |

## 5. Análise crítica e aprendizado da equipe

### 5.1 Limitações técnicas identificadas durante o desenvolvimento

A análise crítica do projeto permitiu à equipe identificar pontos importantes sobre a arquitetura da solução:
* **Persistência em nuvem gratuita:** No plano gratuito do Render, o sistema de arquivos é efêmero, o que significa que o banco SQLite é reiniciado caso o serviço entre em hibernação — comportamento adequado para fins acadêmicos e demonstração, mas que exigiria um banco gerenciado em produção.
* **Segurança do Broker MQTT:** O uso de um broker público (HiveMQ) atende aos testes com dados sintéticos, mas exigiria autenticação e criptografia (TLS) para uso residencial real.
* **Calibração das métricas:** Os percentuais de alerta (20% e 50%) foram definidos como parâmetros iniciais do modelo e precisariam de validação empírica com moradores ao longo do tempo.

### 5.2 Reflexão da equipe

* **Aceleração e Produtividade:** O uso da IA permitiu que a equipe focasse na lógica de negócio, na experiência do usuário e na integração entre front-end, back-end e IoT, reduzindo o tempo gasto com configurações repetitivas e depuração de erros de sintaxe.
* **Aprendizado Técnico:** Acompanhar o desenvolvimento em etapas incrementais facilitou a compreensão de como uma aplicação full-stack se conecta na prática — desde a criação de hooks personalizados no React até o tratamento de requisições HTTP e persistência em banco relacional.
* **Revisão e Protagonismo da Equipe:** A equipe assumiu a responsabilidade de conduzir cada etapa, rodar os testes, validar os fluxos nas telas e alinhar o código às regras do projeto, usando a IA como apoio para acelerar o ritmo e aprofundar o entendimento técnico do grupo.