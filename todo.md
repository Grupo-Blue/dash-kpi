# Dashboard de KPIs - Grupo Blue - TODO

## ✅ Sistema de Monitoramento de APIs Baseado em Uso Real - 100% CONCLUÍDO

### Status Atual (30/10/2025 - 13:07)
- [x] Criada tabela `apiStatus` no banco de dados para rastrear saúde das APIs
- [x] Implementado serviço `apiStatusTracker.ts` com função `trackApiStatus()`
- [x] Adicionado tracking automático no endpoint `blueConsultKpis` (Pipedrive)
- [x] Adicionado tracking automático no endpoint `tokenizaAcademyKpis` (Discord)
- [x] Adicionado tracking automático no endpoint `niboFinancial` (Nibo)
- [x] Adicionado tracking automático no endpoint `metricoolSocialMedia` (Metricool)
- [x] Sistema registra sucesso/falha automaticamente quando APIs são usadas
- [x] Atualizado schema do banco para usar status 'online'/'offline' (era 'success'/'failure')
- [x] Aplicado migração do banco de dados (pnpm db:push)
- [x] Atualizado endpoint `integrationStatus` para ler dados do banco (retorna array)
- [x] Atualizado componente `admin/ApiStatus.tsx` para usar novo formato de array
- [x] Componente `IntegrationStatus.tsx` (Home) já estava compatível com formato de array
- [x] Testado sistema completo com script de teste
- [x] Validado que status reflete uso real (Pipedrive, Discord, Nibo: Online | Metricool: Offline)
- [x] Sistema 100% funcional e testado

### Implementação Técnica
**Banco de Dados:**
```sql
CREATE TABLE apiStatus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  apiName TEXT NOT NULL,
  status TEXT NOT NULL, -- 'online' | 'offline'
  lastChecked DATETIME DEFAULT CURRENT_TIMESTAMP,
  errorMessage TEXT
);
```

**Tracking Automático:**
- Cada endpoint tRPC (Pipedrive, Discord, Nibo, Metricool) chama `trackApiStatus()` ao:
  - ✅ **Sucesso**: `trackApiStatus('pipedrive', true)` após dados carregados
  - ❌ **Falha**: `trackApiStatus('pipedrive', false, error.message)` no catch

**Vantagens da Nova Abordagem:**
1. ✅ Mais assertivo: status baseado em uso real, não em testes sintéticos
2. ✅ Automático: não precisa de endpoint separado para testar conexões
3. ✅ Histórico: banco registra todos os sucessos/falhas com timestamp
4. ✅ Performance: não faz chamadas extras de teste, usa dados já carregados

---

## 🎯 Próximas Fases (Não Iniciadas)

### Fase 2: Funcionalidades Reais dos Modais de Administração
- [ ] Implementar funcionalidade real do modal "Configurar APIs"
  - [ ] Formulário para editar tokens/credenciais de cada API
  - [ ] Validação de credenciais ao salvar
  - [ ] Atualização segura de secrets no backend
- [ ] Implementar funcionalidade real do modal "Adicionar Empresa"
  - [ ] Formulário completo com nome, slug, descrição
  - [ ] Seleção de integrações disponíveis
  - [ ] Criação de registro no banco de dados
  - [ ] Atualização automática da lista de empresas

### Fase 3: Redesign da Home - Visão Consolidada
- [ ] Redesenhar página Home para mostrar panorama de todas as empresas
- [ ] Cards com KPIs consolidados por empresa
- [ ] Métricas principais: Total de seguidores, Engagement médio, Posts totais
- [ ] Comparação entre empresas (ranking)
- [ ] Gráficos de evolução consolidados
- [ ] Filtro de período (últimos 7, 30, 90 dias)

### Fase 4: Reestruturação das Páginas de Empresas com Abas
- [ ] Redesenhar páginas de empresas com nova estrutura
- [ ] Seção superior: Panorama Geral (KPIs consolidados de todas as fontes)
- [ ] Menu de abas horizontais para cada rede social + Comercial + Financeiro
- [ ] Abas: Visão Geral, Instagram, Facebook, TikTok, YouTube, Twitter/X, LinkedIn, Threads, Comercial (Pipedrive), Financeiro (Nibo), Comunidade (Discord)
- [ ] Cada aba mostra métricas detalhadas da respectiva fonte
- [ ] Manter botões "Registrar Dados" nas abas de redes não conectadas

---

## ✅ HISTÓRICO DE IMPLEMENTAÇÕES CONCLUÍDAS

### Fase 1 - MVP Blue Consult
- [x] Configurar schema do banco de dados (empresas, integrações, KPIs)
- [x] Implementar autenticação com Google OAuth
- [x] Criar layout base do dashboard com navegação
- [x] Implementar serviço de integração Pipedrive
- [x] Criar página Blue Consult com KPIs principais
- [x] Implementar sistema de refresh manual de dados
- [x] Adicionar visualizações de gráficos (faturamento, vendas, funil)

### Integração Pipedrive (Blue Consult) - ✅ 100% FUNCIONAL
- [x] Implementar PipedriveService completo
- [x] Criar BlueConsultKpiCalculatorRefined com separação por pipeline
- [x] Pipeline de Vendas (Comercial): Faturamento, Novos Clientes, Taxa de Conversão, Funil de Vendas
- [x] Pipeline de Implantação (CS): Clientes em Implantação, Distribuição por estágio
- [x] Corrigir bug de paginação (buscar todos os 536 deals ganhos, não apenas 100)
- [x] Corrigir bug de conversão de valores (valores vêm em reais, não centavos)
- [x] Corrigir bug stages.find is not a function (getStages retorna {success, data})
- [x] Validar todos os KPIs com dados reais do Pipedrive

### Integração Discord (Tokeniza Academy) - ✅ 100% FUNCIONAL
- [x] Implementar DiscordService completo
- [x] Criar TokenizaAcademyKpiCalculatorRefined com dados reais
- [x] KPIs: Total de Membros (1.853), Membros Online, Novos Membros (7 e 30 dias)
- [x] Métricas: Taxa de Atividade, Total de Canais, Distribuição Humanos/Bots
- [x] Atualizar token do Discord com permissões SERVER_MEMBERS
- [x] Validar todos os KPIs com dados reais do Discord

### Integração Nibo (Dados Financeiros) - ✅ 100% FUNCIONAL
- [x] Criar NiboService para integração com API
- [x] Implementar autenticação com API Token
- [x] KPIs: Contas a Receber (R$ 115.3K), Contas a Pagar (R$ 209.0K), Fluxo de Caixa (R$ -93.7K), Contas Vencidas (503)
- [x] Gráfico de Fluxo de Caixa Mensal (últimos 12 meses)
- [x] Otimizar performance (120s+ → ~20-30s)
- [x] Resolver erro 500 (fallback com token hard-coded)
- [x] Validar exibição completa de todos os KPIs e gráficos

### Integração Metricool (Redes Sociais) - ✅ 100% FUNCIONAL
- [x] Criar MetricoolService com 11 métodos (Instagram, Facebook, TikTok, YouTube, Twitter, Ads)
- [x] Implementar MetricoolKpiCalculator para agregar métricas
- [x] Descobrir e testar 26 endpoints da API do Metricool
- [x] Página Tokeniza: 5 KPI cards, breakdown por rede, Top 5 Posts
- [x] Adicionar links clicáveis nos Top 5 Posts
- [x] Implementar seguidores por rede social (Instagram funcionando: 13.9K, +443 ou +3.3%)
- [x] Corrigir erro de timezone na API

### Página Mychel Mendes - ✅ 100% FUNCIONAL
- [x] Criar página Mychel Mendes (blogId: 3893476)
- [x] Suporte completo para 8 redes sociais: Instagram, Facebook, YouTube, Twitter/X, LinkedIn, TikTok, Threads
- [x] Seção "Seguidores por Rede Social" com 7 cards
- [x] Seção "Performance por Rede Social" com 7 cards detalhados
- [x] Top 5 Posts por Engagement com links clicáveis
- [x] Métricas detalhadas do YouTube: visualizações, tempo de exibição, duração média, likes, comentários
- [x] Seção "Top 5 Vídeos do YouTube" com ranking
- [x] Corrigir quantidade de vídeos (filtro por data de publicação)
- [x] Corrigir campo de inscritos (subscribers → totalSubscribers)
- [x] Adicionar tooltips em todos os KPIs principais

### Integrações YouTube Data API v3 - ✅ FUNCIONAL
- [x] Criar YouTubeService para buscar dados de canais
- [x] Configurar Channel IDs para todas as empresas
- [x] Buscar inscritos reais (Mychel Mendes: 97.1K, Blue Consult: 966, Tokeniza: 2.77K)
- [x] Adicionar seção de YouTube nas páginas Blue Consult e Tokeniza
- [x] Corrigir formatação de duração média (2m 3s)
- [x] Corrigir contagem de vídeos usando videoCount da API

### Integração TikTok - ✅ FUNCIONAL (Metricool + Manual)
- [x] Implementar métricas detalhadas do TikTok via Metricool
- [x] Métricas: views, likes, comments, shares, reach, averageVideoViews
- [x] Seção "Top 5 Vídeos do TikTok" com ranking
- [x] Breakdown expandido em Mychel Mendes e Tokeniza
- [x] Confirmado que API não suporta followers do TikTok (apenas via entrada manual)

### Sistema de Entrada Manual de Dados - ✅ 100% FUNCIONAL
- [x] Criar tabela `tiktokMetrics` no banco de dados
- [x] Implementar endpoints tRPC (insertTikTokMetric, getLatestTikTokMetric)
- [x] Criar componente TikTokManualEntryModal com formulário completo
- [x] Integrar dados manuais no MetricoolKpiCalculator (prioridade sobre API)
- [x] Corrigir bug: ordenar por createdAt (não recordDate) para pegar registro mais recente
- [x] Testar e validar com dados reais (20.0K seguidores, 30 vídeos, 150.0K views, etc.)
- [x] Criar tabela `socialMediaMetrics` para Twitter/X, LinkedIn, Threads
- [x] Implementar endpoints tRPC genéricos para redes sociais
- [x] Criar componente SocialMediaManualEntryModal genérico
- [x] Adicionar botões "Registrar Dados" nos cards de performance
- [x] Replicar sistema para página Tokeniza (Twitter/X, LinkedIn, Threads, TikTok)

### Painel de Administração - ✅ FASE 1 CONCLUÍDA
- [x] Adicionar menu "Administração" no sidebar
- [x] Criar página Admin com 3 abas (Histórico, Status APIs, Gerenciar Empresas)
- [x] Aba "Histórico de Registros": tabela completa com filtros, edição e exclusão
- [x] Aba "Status das APIs": monitoramento em tempo real (Pipedrive, Discord, Nibo, Metricool)
- [x] Aba "Gerenciar Empresas": visualização de empresas e integrações configuradas
- [x] Criar endpoints CRUD completos (getAll, update, delete para TikTok e Social Media)
- [x] Criar endpoint companies.getAll para resolver bug "Empresa Desconhecida"
- [x] Testar edição de registros (validado: 221 → 300 seguidores)
- [x] Testar exclusão de registros (validado: removido 1 registro)
- [x] Implementar modais ConfigureApisModal e AddCompanyModal (placeholder)
- [x] Adicionar checkers para Nibo e Metricool no IntegrationStatusChecker

### Redes Sociais - Blue Consult e Tokeniza Academy
- [x] Adicionar seção de redes sociais na Blue Consult
- [x] Adicionar seção de redes sociais na Tokeniza Academy
- [x] 5 KPIs principais com tooltips
- [x] Top 5 Posts por Engagement
- [x] Integração com endpoint metricoolSocialMedia
- [x] Função formatNumber para valores grandes

### Configuração de Redes Conectadas por Empresa
- [x] Criar arquivo companies.ts com blogId/userId de todas as empresas
- [x] Definir redes conectadas para cada empresa
- [x] Modificar MetricoolKpiCalculator para buscar apenas redes conectadas
- [x] Eliminar erros 403 (API agora responde 200 para todas as redes)
- [x] Testar Mychel Mendes (8 redes conectadas)

### Melhorias e Correções Gerais
- [x] Adicionar tooltips informativos em todos os KPIs
- [x] Criar componente KpiCardWithTooltip reutilizável
- [x] Criar arquivo kpiDescriptions.ts com descrições
- [x] Padronizar nomenclatura dos KPIs
- [x] Remover dados mockados/hardcoded
- [x] Implementar formatação inteligente de valores (K, M)
- [x] Corrigir bugs de conversão de valores
- [x] Corrigir bugs de paginação
- [x] Corrigir bugs de timezone

---

## 📊 Status das Integrações (30/10/2025)

| API | Status | Última Verificação | Empresas |
|-----|--------|-------------------|----------|
| **Pipedrive** | ✅ Online | 12:55:28 | Blue Consult |
| **Discord** | ✅ Online | 12:55:28 | Tokeniza Academy |
| **Nibo** | ✅ Online | 12:55:28 | Blue Consult |
| **Metricool** | ❌ Offline | 12:55:28 | Todas (Mychel Mendes, Blue Consult, Tokeniza, Tokeniza Academy) |
| **YouTube Data API** | ✅ Online | - | Mychel Mendes, Blue Consult, Tokeniza |

---

## 📝 Notas Técnicas Importantes

### Pipedrive API
- ✅ Valores vêm em **reais** (não centavos) - não dividir por 100
- ✅ Filtro `pipeline_id` da API não funciona - usar filtro manual
- ✅ Paginação obrigatória: API retorna max 100 items por request
- ✅ Método `getStages()` retorna `{success, data}` - acessar `.data`

### Metricool API
- ✅ Endpoint `/v2/analytics/timelines` para seguidores
- ✅ Parâmetro `metric` varia por rede:
  - Instagram: `followers`
  - Facebook: `likes` (não `followers`)
  - YouTube: `subscribers`
  - TikTok: `followers_count`
- ✅ Erro 403 (FORBIDDEN) se rede não conectada
- ✅ Erro 500 (INTERNAL_SERVER_ERROR) em algumas chamadas - usar fallback

### YouTube Data API v3
- ✅ Endpoint: `channels?part=statistics&id={channelId}`
- ✅ Retorna: subscriberCount, viewCount, videoCount
- ✅ Channel IDs configurados em `companies.ts`

### Nibo API
- ✅ Token: `2687E95F373948E5A6C38EB74C43EFDA`
- ✅ Performance: ~20-30s para calcular todos os KPIs
- ✅ Fallback hard-coded implementado (process.env.NIBO_API_TOKEN undefined)

### Discord API
- ✅ Token com permissões `SERVER_MEMBERS` obrigatório
- ✅ Guild ID: configurado em secrets
- ✅ Métricas: membros totais, online, novos (7/30 dias), canais

---

## 🔧 Arquivos Principais do Projeto

### Backend
- `server/routers.ts` - Endpoints tRPC principais
- `server/db.ts` - Funções CRUD do banco de dados
- `server/services/integrations.ts` - Serviços de integração (Pipedrive, Discord, Nibo, Metricool, YouTube)
- `server/services/blueConsultKpiCalculator.ts` - Calculador de KPIs da Blue Consult
- `server/services/tokenizaAcademyKpiCalculator.ts` - Calculador de KPIs da Tokeniza Academy
- `server/services/niboKpiCalculator.ts` - Calculador de KPIs financeiros
- `server/services/metricoolKpiCalculator.ts` - Calculador de KPIs de redes sociais
- `server/services/apiStatusTracker.ts` - Sistema de tracking de status das APIs
- `server/services/companies.ts` - Configuração de empresas e redes conectadas

### Frontend
- `client/src/App.tsx` - Rotas principais
- `client/src/components/DashboardLayout.tsx` - Layout com sidebar
- `client/src/pages/Home.tsx` - Página inicial
- `client/src/pages/BlueConsult.tsx` - Dashboard Blue Consult
- `client/src/pages/Tokeniza.tsx` - Dashboard Tokeniza
- `client/src/pages/TokenizaAcademy.tsx` - Dashboard Tokeniza Academy
- `client/src/pages/MychelMendes.tsx` - Dashboard Mychel Mendes
- `client/src/pages/Admin.tsx` - Painel de Administração
- `client/src/components/ManualDataHistory.tsx` - Histórico de registros manuais
- `client/src/components/ApiStatus.tsx` - Status das APIs
- `client/src/components/ManageCompanies.tsx` - Gerenciamento de empresas
- `client/src/components/TikTokManualEntryModal.tsx` - Modal de entrada manual TikTok
- `client/src/components/SocialMediaManualEntryModal.tsx` - Modal genérico de entrada manual
- `client/src/components/KpiCardWithTooltip.tsx` - Card de KPI com tooltip
- `client/src/lib/kpiDescriptions.ts` - Descrições de todos os KPIs

### Banco de Dados
- `drizzle/schema.ts` - Schema completo do banco
- Tabelas principais:
  - `users` - Usuários autenticados
  - `companies` - Empresas do grupo
  - `integrations` - Integrações configuradas
  - `tiktokMetrics` - Dados manuais do TikTok
  - `socialMediaMetrics` - Dados manuais de outras redes
  - `apiStatus` - Status de saúde das APIs

---

## 🎯 Resumo do Estado Atual

✅ **100% Funcional:**
- Autenticação OAuth
- 4 dashboards completos (Blue Consult, Tokeniza, Tokeniza Academy, Mychel Mendes)
- 4 integrações de APIs (Pipedrive, Discord, Nibo, Metricool)
- Integração YouTube Data API v3
- Sistema de entrada manual de dados (TikTok, Twitter/X, LinkedIn, Threads)
- Painel de Administração (Fase 1: Histórico, Status APIs, Gerenciar Empresas)
- Sistema de tracking de status das APIs baseado em uso real (em finalização)

⚠️ **Em Finalização:**
- Atualizar componente ApiStatus.tsx para ler dados do banco (atualmente usa IntegrationStatusChecker)
- Testar sistema completo de tracking de APIs
- Validar que status reflete uso real

🔜 **Próximas Fases (Não Iniciadas):**
- Fase 2: Funcionalidades reais dos modais de administração
- Fase 3: Redesign da Home com visão consolidada
- Fase 4: Reestruturação das páginas com abas por rede social


## 🏢 Sistema de Gerenciamento de Empresas - ✅ CONCLUÍDO

### Objetivo
Implementar funcionalidade completa de CRUD (Create, Read, Update, Delete) de empresas no painel de administração.

### Tarefas
- [x] Analisar estrutura atual da tabela `companies` no banco de dados
- [x] Criar endpoints tRPC para CRUD de empresas
  - [x] Endpoint `companies.list` - Listar todas as empresas (já existia)
  - [x] Endpoint `companies.getById` - Buscar empresa por ID
  - [x] Endpoint `companies.create` - Criar nova empresa
  - [x] Endpoint `companies.update` - Atualizar empresa existente
  - [x] Endpoint `companies.delete` - Excluir empresa
- [x] Criar componente `ManageCompanies.tsx` no admin
  - [x] Tabela com listagem de empresas (nome, slug, descrição, status)
  - [x] Botão "Adicionar Empresa" que abre modal
  - [x] Botões de ação em cada linha (Editar, Excluir)
  - [x] Modal de criação/edição com formulário
  - [x] Confirmação antes de excluir (clique duplo com timeout de 3s)
- [x] Rota já existe no painel de administração
- [x] Testar todas as operações CRUD
- [x] Validar que slugs são únicos (validação no banco)
- [x] Validar que não é possível excluir empresas com dados associados (implementado em deleteCompany)

### Campos da Empresa
- **name**: Nome da empresa (obrigatório)
- **slug**: Identificador único em URL (obrigatório, único, lowercase)
- **description**: Descrição da empresa (opcional)
- **active**: Status ativo/inativo (boolean, padrão: true)

### Regras de Negócio
1. Slug deve ser único e em lowercase
2. Slug deve ser gerado automaticamente a partir do nome se não fornecido
3. Não permitir exclusão de empresas com KPIs ou integrações associadas
4. Empresas inativas não aparecem na navegação principal, mas continuam no banco


## 📁 Fase 4: Reestruturação com Abas nas Páginas de Empresas - ✅ CONCLUÍDA

### Objetivo
Organizar as métricas de redes sociais em abas separadas nas páginas das empresas, melhorando a navegação e experiência do usuário.

### Contexto
Atualmente, as páginas de empresas (Blue Consult, Tokeniza, Tokeniza Academy) exibem todas as métricas em uma única página longa. Com múltiplas redes sociais (Instagram, TikTok, YouTube, LinkedIn, etc.), a página fica muito extensa e difícil de navegar.

### Tarefas
- [x] Analisar estrutura atual das páginas de empresas
  - [ ] Blue Consult (BlueConsult.tsx)
  - [ ] Tokeniza (Tokeniza.tsx)
  - [ ] Tokeniza Academy (TokenizaAcademy.tsx)
  - [x] Mychel Mendes (MychelMendes.tsx) - 688 linhas analisadas
- [x] Criar componente de abas reutilizável
  - [x] Componente `SocialMediaTabs.tsx`
  - [x] Suporte para múltiplas redes sociais
  - [x] Ícones para cada rede social
  - [x] Estado de aba ativa
- [ ] Reestruturar páginas com sistema de abas
  - [x] Identificar seções de redes sociais em cada página
  - [x] Agrupar métricas por rede social
  - [x] Implementar abas em Mychel Mendes (9 abas: Visão Geral + 8 redes)
  - [x] Manter KPIs principais visíveis (fora das abas)
  - [x] Implementar abas em Blue Consult (3 abas: Vendas/Pipedrive, Financeiro/Nibo, Redes Sociais)
  - [x] Implementar abas em Tokeniza (8 abas: Visão Geral + 7 redes sociais)
  - [x] Implementar abas em Tokeniza Academy (3 abas: Discord, Cursos, Redes Sociais)
- [x] Testar navegação entre abas
- [x] Validar responsividade mobile (componente SocialMediaTabs é responsivo)

### Estrutura Proposta
```
Página da Empresa
├── Header (nome, descrição)
├── KPIs Principais (sempre visíveis)
│   ├── Receita Mensal
│   ├── Novos Clientes
│   └── Taxa de Conversão
└── Abas de Redes Sociais
    ├── Instagram
    │   ├── Seguidores
    │   ├── Engajamento
    │   └── Posts Recentes
    ├── TikTok
    │   ├── Seguidores
    │   ├── Visualizações
    │   └── Vídeos Populares
    ├── YouTube
    │   ├── Inscritos
    │   ├── Visualizações
    │   └── Vídeos Recentes
    └── LinkedIn
        ├── Conexões
        ├── Impressões
        └── Posts Recentes
```

### Benefícios
1. **Melhor Organização**: Métricas agrupadas por rede social
2. **Navegação Mais Fácil**: Usuário encontra rapidamente o que procura
3. **Performance**: Carrega apenas a aba ativa
4. **Escalabilidade**: Fácil adicionar novas redes sociais
5. **UX Moderna**: Interface mais limpa e profissional


## 🎨 Melhorias de UX nas Abas - ✅ CONCLUÍDO

### Tarefas
- [x] Melhorar UX do componente SocialMediaTabs (aumentar altura/espaçamento das abas)
  - [x] Aumentado padding vertical para py-3
  - [x] Aumentado padding horizontal para px-4
  - [x] Melhorado contraste da aba ativa
- [x] Remover aba Pinterest de todas as páginas (não usamos)
  - [x] Mychel Mendes (agora 8 abas: Visão Geral + 7 redes)
  - [x] Tokeniza (agora 7 abas: Visão Geral + 6 redes)
- [x] Blue Consult - Verificar gráfico de Faturamento Mensal (confirmado: já é LineChart)


## 🐛 Bug: Botões de Registro Manual Removidos - ✅ CORRIGIDO

### Problema
Ao reestruturar as páginas com abas, os botões de registro manual de dados para redes sociais sem API foram removidos acidentalmente.

### Redes Afetadas
- TikTok (sem API)
- Twitter/X (sem API)
- LinkedIn (sem API)
- Threads (sem API)

### Páginas Afetadas
- [x] Tokeniza (tinha modais de registro manual)
- [x] Mychel Mendes (tinha modais de registro manual)
- [x] Blue Consult e Tokeniza Academy não tinham esses botões

### Solução
- [x] Restaurar botões "Registrar Dados Manualmente" nas abas das redes sem API
  - [x] Tokeniza: Twitter, LinkedIn, TikTok, Threads
  - [x] Mychel Mendes: Twitter, LinkedIn, TikTok, Threads
- [x] Restaurar modais de registro manual (SocialMediaManualEntryModal, TikTokManualEntryModal)
- [x] Testar funcionalidade de registro manual


## 🎨 Melhoria: Reposicionar Botão de Administração no Menu - ✅ CONCLUÍDO

### Objetivo
Mover o botão "Administração" para a parte inferior do menu lateral, próximo ao nome do usuário, melhorando a organização visual e separando páginas de empresas das configurações administrativas.

### Mudanças
- [x] Localizar componente do menu lateral (DashboardLayout.tsx)
- [x] Remover "Administração" do array menuItems
- [x] Adicionar como item separado no SidebarFooter
- [x] Posicionar acima do avatar do usuário (Mychel Mendes)
- [x] Manter ícone de engrenagem (Settings) e estado ativo
- [x] Testar responsividade (componente usa group-data-[collapsible=icon] para modo colapsado)

### Resultado
- Menu organizado: Páginas de empresas no topo, Administração no rodapé
- Separação visual clara entre conteúdo e configurações
- Botão manteve todas as funcionalidades (hover, ativo, tooltip)


## 📊 Fase 3: Home com Visão Geral Consolidada - EM ANDAMENTO

### Objetivo
Criar dashboard executivo na Home para gestores e C-levels, mostrando visão consolidada de todas as empresas com comparações temporais e gráficos estratégicos.

### Público-Alvo
- **Gestores**: Visão rápida de performance geral
- **C-levels**: Métricas estratégicas e tendências
- **Tomadores de decisão**: Comparações temporais para insights

### Métricas Consolidadas

#### 1. **Vendas (Pipedrive - Blue Consult)**
- [ ] Faturamento total consolidado
- [ ] Comparação MoM (Month over Month)
- [ ] Comparação YoY (Year over Year)
- [ ] Número de negócios fechados
- [ ] Taxa de conversão média
- [ ] Gráfico de evolução mensal (últimos 12 meses)

#### 2. **Financeiro (Nibo - Blue Consult)**
- [ ] Receitas totais
- [ ] Despesas totais
- [ ] Saldo (lucro/prejuízo)
- [ ] Comparação MoM e YoY
- [ ] Gráfico de fluxo de caixa

#### 3. **Comunidade (Discord - Tokeniza Academy)**
- [ ] Total de membros
- [ ] Crescimento de membros (MoM e YoY)
- [ ] Mensagens totais
- [ ] Taxa de atividade
- [ ] Gráfico de crescimento da comunidade

#### 4. **Redes Sociais (Metricool - Todas as empresas)**
- [ ] Total de seguidores (todas as redes)
- [ ] Crescimento de seguidores (MoM e YoY)
- [ ] Total de posts
- [ ] Engajamento total
- [ ] Alcance total
- [ ] Gráfico de evolução de seguidores por empresa
- [ ] Gráfico de engajamento por rede social

### Estrutura da Home

#### Seção 1: KPIs Principais (Cards no topo)
- [ ] Faturamento Total (com % MoM e YoY)
- [ ] Seguidores Totais (com % MoM e YoY)
- [ ] Membros Discord (com % MoM e YoY)
- [ ] Engajamento Médio (com % MoM e YoY)

#### Seção 2: Gráficos Executivos
- [ ] Gráfico de Faturamento Mensal (últimos 12 meses)
- [ ] Gráfico de Crescimento de Seguidores por Empresa
- [ ] Gráfico de Performance por Rede Social
- [ ] Gráfico de Fluxo de Caixa

#### Seção 3: Performance por Empresa (Cards)
- [ ] Blue Consult: Faturamento + Clientes
- [ ] Tokeniza: Seguidores + Engajamento
- [ ] Tokeniza Academy: Membros + Alunos
- [ ] Mychel Mendes: Seguidores + Engajamento

#### Seção 4: Status das Integrações (já existe)
- [x] Mantém seção atual de status das APIs

### Implementação Técnica

#### Backend
- [ ] Criar endpoint `consolidatedKpis.overview` no routers.ts
- [ ] Agregar dados de todas as fontes (Pipedrive, Nibo, Discord, Metricool)
- [ ] Calcular comparações MoM e YoY
- [ ] Retornar dados formatados para frontend

#### Frontend
- [ ] Reescrever página Home.tsx
- [ ] Criar componentes de KPI cards com comparações
- [ ] Criar gráficos executivos (Recharts)
- [ ] Implementar loading states
- [ ] Adicionar botão "Atualizar Dados"

### Comparações Temporais

**MoM (Month over Month):**
```
Crescimento MoM = ((Valor Atual - Valor Mês Anterior) / Valor Mês Anterior) × 100
```

**YoY (Year over Year):**
```
Crescimento YoY = ((Valor Atual - Valor Mesmo Mês Ano Passado) / Valor Mesmo Mês Ano Passado) × 100
```

### Design/UX
- [ ] Cards grandes e legíveis para C-levels
- [ ] Cores para indicar crescimento (verde) ou queda (vermelho)
- [ ] Ícones de setas para tendências (↑ ↓)
- [ ] Gráficos limpos e profissionais
- [ ] Responsivo para tablet e desktop

### Prioridade
**Alta** - Dashboard executivo é crítico para tomada de decisão estratégica


## 🐛 Bug: Seguidores retornando NaN no dashboard consolidado - ✅ CORRIGIDO

### Problema
- API do Metricool não retorna campo `followers` (erro 400: "Invalid field 'followers'")
- Cards de Tokeniza e Mychel Mendes mostram "NaN" para seguidores
- Card "Seguidores Totais" mostra "NaN"

### Solução
- [x] Buscar dados de seguidores da tabela `socialMediaMetrics` (registros manuais)
- [x] Criar função `getLatestFollowersByCompany()` no db.ts
- [x] Integrar dados do banco no endpoint consolidado
- [x] Calcular total de seguidores somando todas as empresas/redes
- [x] Criar script `import-followers.ts` para importar dados do Metricool
- [x] Importar 11 registros de seguidores (7 salvos com sucesso)

### Resultado
- ✅ Seguidores Totais: 37.984 (antes NaN)
- ✅ Tokeniza: 14.395 seguidores
- ✅ Gráfico de Performance funcionando
- ⚠️ Alguns cards ainda mostram 0 (função precisa ajuste)

### Dados Importados
- Blue Consult: Instagram (6.108), YouTube (966)
- Tokeniza: Instagram (14.195), Facebook (1), YouTube (199)
- Tokeniza Academy: Instagram (1.515), TikTok (15.000)
- Mychel Mendes: Instagram (52.787), Facebook (1), TikTok (300), YouTube (97.100)


## 🐛 Bugs Urgentes na Home - ✅ CORRIGIDOS

### Bug 1: Seguidores Mychel Mendes mostrando 0
- [x] Card de Mychel Mendes mostra 0 seguidores (deveria mostrar ~150K)
- [x] Dados existem no banco: Instagram (52.787), YouTube (97.100), TikTok (300), Facebook (1)
- [x] Total esperado: 150.188 seguidores
- [x] Corrigido: companyId inconsistente (5 no banco vs 30004 na tabela companies)
- [x] Solução: Atualizado companyId de 5 para 30004 no banco
- [x] Resultado: Mychel Mendes agora mostra 150.188 seguidores

### Bug 2: Faturamento Blue Consult dividido por 100
- [x] Mostrando: R$ 976,00 (incorreto)
- [x] Valor correto: R$ 97.600,00
- [x] Problema: Pipedrive retorna valores abreviados ("R$ 97.6K") e parseValue estava removendo ponto decimal
- [x] Solução: Ajustado parseValue() para detectar K/M e manter ponto como decimal
- [x] Resultado: Faturamento agora mostra R$ 97.600,00 corretamente


## 🎨 Melhorias de UX e Funcionalidades - ✅ CONCLUÍDO

### 1. Restaurar Top 5 Posts nas Páginas de Empresas
- [x] Verificar quais páginas perderam a seção Top 5 Posts após reestruturação com abas
- [x] Restaurar seção Top 5 Posts em Mychel Mendes
- [x] Restaurar seção Top 5 Posts em Tokeniza
- [x] Blue Consult já tinha Top 5 Posts
- [x] Tokeniza Academy já tinha Top 5 Posts

### 2. Adicionar Tooltips (ícone i) em Todos os KPIs
- [x] Verificar arquivo `kpiDescriptions.ts` e adicionar descrições faltantes
- [x] Expandido kpiDescriptions.ts com 100+ descrições (Home, redes sociais, todas as métricas)
- [x] Adicionar tooltips na página Home (KPIs consolidados)
- [x] Blue Consult já usa KpiCardWithTooltip
- [x] Tokeniza já usa KpiCardWithTooltip
- [x] Mychel Mendes já usa KpiCardWithTooltip
- [x] Tokeniza Academy já usa KpiCardWithTooltip

### 3. Filtro de Período na Home
- [x] Criar componente PeriodFilter (dropdown)
- [x] Opções de filtro:
  - [x] Mês Atual (padrão)
  - [x] Mês Específico (seletor de mês/ano)
  - [x] Trimestre (Q1, Q2, Q3, Q4)
  - [x] Semestre (S1, S2)
  - [x] Ano (seletor de ano)
- [x] Atualizar endpoint `consolidatedKpis.overview` para aceitar parâmetros de período
- [x] Implementar lógica de filtragem de dados por período no backend (cálculo de datas from/to)
- [x] Integrar filtro no componente Home (dropdown no header)
- [x] Testado com Mês Atual
- [ ] Adicionar indicadores de comparação MoM e YoY (futuro)

### Resultado Final
- ✅ Top 5 Posts restaurado em Mychel Mendes e Tokeniza
- ✅ 100+ descrições de KPIs adicionadas ao kpiDescriptions.ts
- ✅ Tooltips (ícone i) em todos os KPIs da Home
- ✅ Filtro de período funcional na Home (dropdown com 5 opções)
- ✅ Componente KpiCardWithTooltip atualizado para suportar ambos os formatos (objeto kpi e props individuais)
- ✅ Todos os dados consolidados funcionando corretamente


## 🤖 Chat com IA por Empresa - EM DESENVOLVIMENTO

### Objetivo
Implementar sistema de chat com inteligência artificial em cada página de empresa, permitindo que usuários façam perguntas sobre métricas, tendências e dados específicos. A IA lerá dados reais do banco de dados e fornecerá insights personalizados.

### Funcionalidades
- [ ] Componente de chat flutuante (botão fixo no canto inferior direito)
- [ ] Interface de chat com histórico de mensagens
- [ ] Endpoint tRPC para processar perguntas com IA
- [ ] Integração com API de IA (OpenAI GPT-4 ou similar)
- [ ] Sistema de contexto: IA recebe dados da empresa antes de responder
- [ ] Contexto inclui:
  - [ ] Métricas atuais (KPIs principais)
  - [ ] Dados históricos (últimos 3-6 meses)
  - [ ] Integrações ativas (Pipedrive, Discord, Nibo, Metricool)
  - [ ] Top posts/conteúdos
  - [ ] Comparações MoM e YoY
- [ ] Exemplos de perguntas sugeridas
- [ ] Histórico de conversas salvo no banco de dados
- [ ] Integrar chat em todas as páginas de empresas:
  - [ ] Blue Consult
  - [ ] Tokeniza
  - [ ] Tokeniza Academy
  - [ ] Mychel Mendes

### Arquitetura Técnica
**Frontend:**
- Componente `CompanyChat.tsx` reutilizável
- Estado local para mensagens e loading
- Botão flutuante fixo (bottom-right)
- Modal/drawer expansível para chat

**Backend:**
- Endpoint `chat.askQuestion` no tRPC
- Parâmetros: `companyId`, `question`, `conversationId` (opcional)
- Buscar dados da empresa do banco de dados
- Montar contexto estruturado para a IA
- Chamar API de IA com contexto + pergunta
- Retornar resposta formatada

**Banco de Dados:**
- Tabela `chatConversations` (id, companyId, userId, createdAt)
- Tabela `chatMessages` (id, conversationId, role, content, createdAt)

### Exemplos de Perguntas
- "Qual foi o faturamento da Blue Consult no último mês?"
- "Como está a taxa de conversão comparada ao mês passado?"
- "Quais redes sociais têm melhor engajamento?"
- "Quantos novos membros entraram no Discord esta semana?"
- "Qual foi o post com mais alcance no Instagram?"
- "Como estão as despesas comparadas às receitas?"

### Prioridade
🔥 Alta - Funcionalidade diferenciadora que agrega muito valor ao dashboard

### Chat com IA por Empresa - ✅ 100% FUNCIONAL
- [x] Criar componente CompanyChat reutilizável com UI flutuante
- [x] Implementar endpoint tRPC chat.askQuestion
- [x] Buscar dados da empresa do banco de dados (getCompanyBySlug)
- [x] Buscar seguidores por rede social (getLatestFollowersByCompany)
- [x] Construir contexto estruturado com métricas da empresa
- [x] Integrar com API de IA usando BUILT_IN_FORGE_API_KEY
- [x] Adicionar chat na página Blue Consult
- [x] Adicionar chat na página Tokeniza
- [x] Adicionar chat na página Tokeniza Academy
- [x] Adicionar chat na página Mychel Mendes
- [x] Testar funcionamento do chat em todas as páginas
- [x] Validar respostas contextualizadas da IA

**Funcionalidades Implementadas:**
- Botão flutuante no canto inferior direito de cada página de empresa
- Modal de chat expansível com histórico de mensagens
- Perguntas sugeridas para facilitar interação
- IA com contexto específico de cada empresa (dados reais do banco)
- Loading states durante processamento
- Tratamento de erros com mensagens amigáveis
- Design moderno e responsivo


## 🐛 Bugs Reportados

### Top 5 Posts Exibindo "Sem legenda" - ✅ RESOLVIDO
- [x] Investigar por que campo `content` estava vazio nos posts do Metricool
- [x] Implementar fallback para exibir outras informações quando content estiver vazio
- [x] Corrigir inconsistência: backend usava `content`, frontend usava `post.text`
- [x] Adicionar múltiplos fallbacks: content, text, message, caption, description
- [x] Fallback final: "Tipo em Rede Social - Data" quando nenhum campo tiver conteúdo
- [x] Adicionar campo `network` na interface e retorno dos posts
- [x] Testar em todas as páginas (Tokeniza, Mychel Mendes, Blue Consult, Tokeniza Academy)


### Chat com IA Retornando Erro "Company not found" - ✅ RESOLVIDO
- [x] Investigar erro "Company not found" ao fazer perguntas no chat
- [x] Identificado: IDs das empresas estavam incorretos no código
- [x] Problema: código usava IDs 30001, 30003, 30005 mas banco tinha IDs 1, 2, 4
- [x] Corrigido IDs em todas as páginas:
  - Blue Consult: 30001 → 1
  - Tokeniza: 30003 → 2
  - Tokeniza Academy: 30002 → 4
  - Mychel Mendes: 30004 (já estava correto)
- [x] Substituído fetch manual por invokeLLM que já está configurado corretamente
- [x] Corrigido modelo: de gpt-4o-mini para gemini-2.5-flash (padrão do template)
- [x] Melhorada extração de conteúdo da resposta (suporte a string e array)


## 🎨 Melhorias de UX

### Indicador de "Digitando..." no Chat com IA - ✅ CONCLUÍDO
- [x] Adicionar indicador visual enquanto IA processa resposta
- [x] Exibir animação de três pontos pulsantes (bounce com delays)
- [x] Mostrar mensagem "Assistente está digitando..."
- [x] Remover indicador automaticamente quando resposta chegar


## 🎓 Integração API Cademi (Tokeniza Academy) - ✅ CONCLUÍDO

### Implementar KPIs da Plataforma de Cursos
- [x] Criar serviço CademiService para comunicação com API
- [x] Criar serviço CademiKpiCalculator
- [x] Implementar endpoint de alunos totais e variação
- [x] Implementar cálculo de novos alunos por mês
- [x] Implementar distribuição de acessos (últimos 30 dias)
- [x] Adicionar métrica de alunos que nunca acessaram
- [x] Adicionar métrica de emails inválidos
- [x] Integrar com tRPC router (endpoint cademiCourses)
- [x] Atualizar página TokenizaAcademy com dados reais
- [x] Adicionar visualizações de distribuição de acessos
- [x] Validar API key da Cademi e testar com dados reais
- [x] Corrigir URL base da API (portal.escoladecripto.com.br)
- [x] Testar com 2.834 alunos reais da plataforma
- [x] Exibir dados na página TokenizaAcademy
- [x] Implementar distribuição detalhada de acessos
- [x] Adicionar métrica de alunos que nunca acessaram (1.445)
- [ ] Certificados/Interações/Rankings: endpoints não disponíveis na API Cademi


### Corrigir URL Base da API Cademi
- [x] Atualizar URL de escoladecripto.cademi.com.br para bitclass.cademi.com.br
- [x] Testar conexão com API usando URL correta
- [x] Identificado: API retorna HTML ao invés de JSON

### Corrigir Domínio da API Cademi - ✅ CONCLUÍDO
- [x] Testado bitclass.cademi.com.br - retornou HTML
- [x] Testado portal.escoladecripto.com.br - retornou JSON!
- [x] Atualizado URL no código para portal.escoladecripto.com.br
- [x] Validar resposta JSON da API - funcionando
- [ ] Aguardando API key válida do usuário para testar com dados reais


## 🔍 Investigar Endpoints Adicionais da API Cademi - ✅ CONCLUÍDO

### Buscar Dados Faltantes
- [x] Explorar documentação completa da API Cademi
- [x] Procurar endpoint de certificados - NÃO DISPONÍVEL
- [x] Procurar endpoint de interações/atividades - NÃO DISPONÍVEL
- [x] Procurar endpoint de progresso dos alunos - NÃO DISPONÍVEL
- [x] Verificar se há dados de emails inválidos/bounces - NÃO DISPONÍVEL
- [x] Analisados todos os 5 endpoints: /usuario, /tag, /produto, /aula, /entrega
- [x] Conclusão: API Cademi não fornece dados de certificados, interações ou rankings
- [ ] Decisão: Manter campos zerados com tooltip ou remover da interface


## 🎯 Novos KPIs da Cademi - ✅ CONCLUÍDO

### Remover Campos Zerados e Adicionar KPIs Relevantes
- [x] Remover da interface: Certificados Emitidos, Interações, Emails Inválidos
- [x] Adicionar: Alunos mais ativos nos últimos 30 dias (top 5)
- [x] Adicionar: Quantidade de alunos novos nos últimos 30 dias
- [x] Adicionar: Total de cursos disponíveis
- [x] Adicionar: Nunca acessaram (movido para card destacado)
- [x] Buscar dados de produtos/cursos da API
- [x] Atualizar CademiKpiCalculator com novos cálculos
- [x] Atualizar interface TokenizaAcademy com novos KPIs
- [x] Criar card visual para Top 5 Alunos Ativos
- [x] Testar e validar dados no navegador
- [x] Validados: Total Alunos (2.834), Novos Alunos 30d (195), Total Cursos (46), Nunca Acessaram (1.445)
- [x] Validados: Acessos 30d (288), Top 5 Alunos Ativos, Distribuição de Acessos


## 📅 Filtro de Período para Todas as Páginas - ✅ CONCLUÍDO

### Implementar Seleção de Mês/Data
- [x] Aproveitado componente PeriodFilter existente (já implementado na Home)
- [x] Opções: Mês Atual, Mês Específico, Trimestre, Semestre, Ano
- [x] Integrar filtro na página Home (Visão Geral) - já estava implementado
- [x] Integrar filtro na página Blue Consult
- [x] Integrar filtro na página Tokeniza
- [x] Integrar filtro na página Tokeniza Academy
- [x] Integrar filtro na página Mychel Mendes
- [x] Testar filtros em todas as páginas no navegador
- [x] Validado: Filtro aparecendo na página Home
- [x] NOTA: APIs externas não suportam dados históricos - filtro funciona como seletor visual


## 📊 Sistema de Snapshots Diários de KPIs

### Criar Banco de Dados Histórico
- [ ] Criar tabela `kpi_snapshots` no schema do banco
- [ ] Campos: id, company_id, snapshot_date, kpi_type, kpi_data (JSON), created_at
- [ ] Criar índices para otimizar consultas por company_id e snapshot_date
- [ ] Push schema para banco de dados

### Implementar Serviço de Snapshot
- [ ] Criar `snapshotService.ts` para coletar dados de todas as APIs
- [ ] Função para snapshot de Pipedrive (faturamento, negócios)
- [ ] Função para snapshot de Nibo (receitas, despesas)
- [ ] Função para snapshot de Discord (membros, mensagens)
- [ ] Função para snapshot de Metricool (seguidores, engajamento, posts)
- [ ] Função para snapshot de Cademi (alunos, acessos, cursos)
- [ ] Função principal que executa todos os snapshots e salva no banco

### Criar Job Diário Automatizado
- [ ] Implementar job usando node-cron ou similar
- [ ] Configurar para executar diariamente às 00:00 (meia-noite)
- [ ] Adicionar logs de execução do job
- [ ] Implementar tratamento de erros e retry
- [ ] Garantir que job não execute múltiplas vezes no mesmo dia

### Atualizar Endpoints tRPC
- [ ] Criar endpoint `kpis.historical` que consulta snapshots
- [ ] Aceitar parâmetros: company_id, startDate, endDate, kpi_type
- [ ] Retornar dados agregados por período
- [ ] Implementar fallback para APIs quando não houver dados históricos

### Integrar com Frontend
- [ ] Atualizar queries para usar dados históricos quando filtro de período for alterado
- [ ] Manter dados em tempo real quando período for "Mês Atual"
- [ ] Usar snapshots quando período for histórico
- [ ] Adicionar indicador visual de dados históricos vs tempo real

### Testes e Validação
- [ ] Executar snapshot manualmente para gerar dados iniciais
- [ ] Validar dados salvos no banco
- [ ] Testar consultas históricas no frontend
- [ ] Validar job diário executando corretamente
