# Projeto: App Web de Acompanhamento de Glicemia

> Documento de premissas do projeto, construído por entrevista em 22/09/2026.
> Serve de referência para as decisões de desenvolvimento. Itens marcados como *(a confirmar)* são premissas assumidas que ainda precisam de validação.

---

## 1. Visão geral

- **O que é:** aplicação web para registrar e acompanhar medições de glicemia (nível de açúcar no sangue).
- **Plataformas:** navegador em computadores e celulares. O layout é **responsivo** e se adapta a qualquer tamanho de tela. Não é PWA nem app nativo.
- **Objetivo do projeto:** **aprendizado e portfólio**. O código deve ser bem organizado, testado e demonstrável, mas o app também precisa funcionar de verdade para uso pessoal.
- **Idioma:** somente português (pt-BR), com datas no formato dd/mm/aaaa e fuso horário de Brasília (America/Sao_Paulo).

## 2. Usuário

- **Quem usa:** uma **única pessoa**. O login protege os dados, mas não existe cadastro aberto para vários usuários, nem papéis como médico ou cuidador.
- **Perfil clínico:** diabetes **tipo 2**.
  - No tipo 2 o corpo produz insulina, mas não a usa bem (resistência à insulina).
  - O tratamento costuma combinar dieta, exercício e remédios orais (ex.: metformina). Parte dos pacientes também usa insulina.
  - A glicemia é medida com frequência moderada: de algumas vezes por semana a algumas vezes por dia.

## 3. Entrada de dados

- **Forma:** **digitação manual** do valor mostrado pelo glicosímetro (aparelho de ponta de dedo).
- O formulário de registro deve ser **rápido no celular**: teclado numérico, data e hora preenchidas com o momento atual e poucos toques até salvar.
- O usuário pode **editar e excluir** medições já registradas.
- Validação do valor: somente números inteiros de **20 a 600 mg/dL**, o limite típico de leitura dos glicosímetros.

## 4. Modelo de dados

### Medição
| Campo | Tipo | Observação |
|---|---|---|
| id | identificador | — |
| valor | inteiro (mg/dL) | obrigatório |
| data_hora | data e hora com fuso | obrigatório, padrão = agora |
| criado_em / atualizado_em | data e hora | auditoria |

- **Unidade:** somente **mg/dL**, o padrão brasileiro. Não haverá conversão para mmol/L.
- **Momento da medição (jejum, pós-refeição etc.):** **não** será registrado.
  - Consequência: o app não avalia o valor contra metas específicas por momento, como jejum de 80 a 130 ou até 180 duas horas após a refeição. A avaliação usa uma faixa geral.
- **Dados extras (medicamentos, refeições, exercício, observações):** fora de escopo. *(a confirmar)*
- **Outros indicadores (HbA1c, peso, pressão):** fora de escopo. *(a confirmar)*

### Usuário
- E-mail e senha (armazenada **somente como hash**, com bcrypt ou argon2).

## 5. Classificação dos valores

Faixas **fixas** (não configuráveis pelo usuário), baseadas no consenso internacional de tempo no alvo:

| Faixa | Valor (mg/dL) | Significado |
|---|---|---|
| Hipoglicemia grave | < 54 | Perigoso |
| Hipoglicemia | 54 – 69 | Baixo |
| No alvo | 70 – 180 | Faixa-alvo geral |
| Alto | 181 – 250 | Acima do alvo |
| Muito alto | > 250 | Bem acima do alvo |

- **Alertas:** somente **destaque visual** (cor e ícone por faixa). Sem textos de orientação médica e sem notificações.
- **Acessibilidade:** a faixa nunca é indicada só por cor (daltonismo). Deve ter também ícone ou rótulo em texto.

## 6. Funcionalidades

### 6.1 Dashboard (tela principal)
- **Cartões de estatísticas** do período selecionado:
  - média
  - valor mínimo e máximo
  - **% no alvo** (medições entre 70 e 180 mg/dL)
  - também útil: quantidade de medições e de hipoglicemias no período *(a confirmar)*
- **Seletor de período:** 7, 14, 30 e 90 dias.
- **Gráfico de linha** da glicemia ao longo do tempo, com a faixa-alvo (70 a 180) sombreada e os pontos coloridos pela classificação.
- **Lista** das medições recentes, com a classificação visível.
- Atalho sempre visível para **"Nova medição"**.
- Sem HbA1c estimada, porque com poucas medições de ponta de dedo o cálculo é impreciso.

### 6.2 Histórico
- Lista completa das medições com filtro por período e ações de editar e excluir.

### 6.3 Exportação
- **CSV:** todas as medições (ou as do período) para abrir em planilha.
- **PDF:** relatório para levar à consulta médica, com período, estatísticas, gráfico e tabela de medições.

### 6.4 Conta
- Login e logout com e-mail e senha.
- Trocar senha.
- **Apagar todos os dados** (direito de exclusão, LGPD).

## 7. Arquitetura e tecnologia

| Camada | Escolha |
|---|---|
| Backend | **Python + FastAPI** (API REST) |
| Frontend | **React** (Vite), SPA consumindo a API |
| Banco de dados | **PostgreSQL** |
| Autenticação | E-mail e senha (hash argon2), sessão com JWT guardado em **cookie HttpOnly** (SameSite=Lax) |
| Ambiente de desenvolvimento | **Docker Compose** (PostgreSQL + backend + frontend), sem precisar instalar Python ou Node localmente. SQLite fica como alternativa para rodar sem Docker. |
| Imagem de produção | `Dockerfile` multi-stage: compila o frontend e gera uma imagem única com o backend |
| Criação do usuário | Por linha de comando (`python -m app.cli criar-usuario`), sem tela de cadastro |
| Deploy | **PaaS gratuito ou barato** (Render, Railway ou Fly.io), publicado a partir do GitHub |

Sugestões ainda não decididas:
- ORM: SQLAlchemy 2.x + Alembic (migrations). Validação: Pydantic.
- Gráficos no front: Recharts ou Chart.js. Estilo: Tailwind CSS.
- PDF: gerado no backend (WeasyPrint ou ReportLab) ou no front.
- Testes: pytest no backend, Vitest no front.
- Docker Compose para o ambiente de desenvolvimento.

## 8. Requisitos não funcionais

- **Responsividade:** mobile-first. Deve funcionar bem de cerca de 320px (celular pequeno) até monitores largos. Gráfico e tabelas se adaptam ou rolam horizontalmente no celular.
- **Usabilidade:** áreas de toque confortáveis (pelo menos 44px) e fonte legível.
- **Acessibilidade:** contraste adequado (WCAG AA), navegação por teclado, rótulos nos campos, informação nunca dependente só de cor.
- **Segurança e privacidade** (dados de saúde são *dados sensíveis* pela LGPD):
  - HTTPS obrigatório em produção
  - senhas com hash
  - toda consulta filtrada pelo usuário autenticado
  - opção de apagar todos os dados
  - segredos em variáveis de ambiente, nunca no repositório
- **Aviso legal** visível: *"Este aplicativo não substitui orientação médica."*

## 9. Fora de escopo (versão inicial)

- Múltiplos usuários, cadastro aberto, papéis de médico ou cuidador
- Integração com sensores contínuos (CGM) e importação de arquivos
- Registro do momento da medição, medicamentos, refeições, exercício e observações
- HbA1c, peso e pressão arterial
- Faixas-alvo personalizáveis
- Orientações médicas automáticas e notificações ou lembretes
- PWA/offline e app nativo
- Outros idiomas e a unidade mmol/L

## 10. Pontos em aberto

1. Confirmar que não haverá dados extras, nem mesmo um campo de observação livre (custo baixo e muito útil).
2. Gerar o PDF no backend ou no front. **Ainda não implementado.** A exportação CSV já existe.
3. Conta demo com dados fictícios para quem avaliar o portfólio (sugestão para o futuro).
4. Possíveis evoluções: registrar o momento da medição (permite metas por momento), lembretes e HbA1c.

**Decididos na estrutura inicial (22/09/2026):** edição e exclusão de medições liberadas, validação de 20 a 600 mg/dL e sessão via JWT em cookie HttpOnly.

## 11. Glossário

- **Glicemia:** concentração de glicose (açúcar) no sangue, medida em mg/dL.
- **Glicosímetro:** aparelho que mede a glicemia a partir de uma gota de sangue da ponta do dedo.
- **Hipoglicemia:** glicemia baixa (< 70 mg/dL). Causa tremor, suor e confusão, e pode ser perigosa.
- **Hiperglicemia:** glicemia alta (> 180 mg/dL, na faixa geral usada aqui).
- **Tempo no alvo (TIR, *Time in Range*):** porcentagem de medições dentro da faixa-alvo (70 a 180 mg/dL).
- **HbA1c (hemoglobina glicada):** exame de laboratório que reflete a média da glicemia dos últimos cerca de 3 meses.
- **CGM (monitor contínuo de glicose):** sensor na pele que mede a glicose a cada poucos minutos (ex.: FreeStyle Libre, Dexcom).
- **Diabetes tipo 2:** forma mais comum. O corpo produz insulina, mas não a usa bem.
- **LGPD:** Lei Geral de Proteção de Dados, que classifica dados de saúde como sensíveis.
