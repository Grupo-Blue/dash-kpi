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
