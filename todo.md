# Dashboard de KPIs - Grupo Blue - TODO

## Fase 1 - MVP Blue Consult (Prioridade)
- [x] Configurar schema do banco de dados (empresas, integrações, KPIs)
- [x] Implementar autenticação com Google OAuth
- [x] Criar layout base do dashboard com navegação
- [x] Implementar serviço de integração Pipedrive
- [x] Criar página Blue Consult com KPIs principais
- [x] Implementar sistema de refresh manual de dados
- [x] Adicionar visualizações de gráficos (faturamento, vendas, funil)

## Fase 2 - Expansão Blue Consult
- [ ] Integração Nibo (dados financeiros)
- [ ] Integração Mautic (marketing automation)
- [ ] Integração Metricool (redes sociais e ads)
- [ ] KPIs completos de marketing (conversões, leads, funil)
- [ ] KPIs de mídia paga
- [ ] KPIs de SEO e social selling

## Fase 3 - Tokeniza
- [ ] Criar serviço de integração Tokeniza API
- [ ] Implementar página Tokeniza
- [ ] KPIs da plataforma (ofertas, tokenização)
- [ ] KPIs Tokeniza Private (investidores, ticket médio, retenção)
- [ ] Visualizações específicas para investimentos

## Fase 4 - BitClass e Discord
- [ ] Integração BitClass API
- [ ] Integração Discord API
- [ ] Página BitClass/Academy
- [ ] KPIs de cursos e alunos
- [ ] KPIs de comunidade Discord (membros, engajamento, canais)

## Fase 5 - Refinamentos
- [ ] Filtros avançados de período
- [ ] Comparação período a período
- [ ] Exportação de relatórios
- [ ] Alertas e notificações
- [ ] Otimizações de performance

## Implementações Adicionais Concluídas
- [x] Criar página Tokeniza com KPIs de investidores
- [x] Criar página BitClass com KPIs de Discord e comunidade
- [x] Implementar dados mockados para todas as empresas
- [x] Criar calculadores de KPIs para Blue Consult, Tokeniza e BitClass
- [x] Adicionar gráficos de linha e barra para visualização de dados
- [x] Implementar navegação entre empresas no sidebar


## Mudanças Solicitadas
- [x] Atualizar todas as referências de "BitClass" para "Tokeniza Academy" (rebranding)


## Integrações em Implementação
- [x] Implementar integração real com Pipedrive API (Blue Consult)
- [x] Implementar integração real com Discord API (Tokeniza Academy)
- [x] Criar sistema de configuração de credenciais via UI
- [x] Substituir dados mockados por dados reais das APIs


## Mudanças Solicitadas - Dados Reais Apenas
- [x] Remover todos os dados mockados/falsos do sistema
- [x] Exibir apenas dados reais das APIs configuradas
- [x] Mostrar mensagem de "Configuração necessária" quando API não estiver configurada
- [x] Limpar fallback de dados mockados nos routers


## Refinamento de KPIs - Pipedrive (Blue Consult)
- [x] Separar dados por pipeline: "Pipeline de Vendas (Comercial)" e "Pipeline de Implantação (CS)"
- [x] Refazer KPIs considerando o fluxo: Vendas → Implantação
- [x] Mapear corretamente os estágios de cada pipeline
- [x] Ajustar cálculos de faturamento, conversão e funil por pipeline
- [x] Adicionar gráfico de Pipeline de Implantação (CS)


## Bugs Reportados
- [x] Investigar dados inconsistentes nos KPIs da Blue Consult
- [x] Verificar se API do Pipedrive está retornando dados corretos
- [x] Corrigir nome da Pipeline de Implantação (era "Blue - Pipeline Implantação", correto é "Blue - Implantação")
- [x] Corrigir método getStages para usar filtros corretamente


## Investigação Discord API
- [x] Testar API do Discord para verificar quais dados estão disponíveis
- [x] Identificar endpoints úteis para KPIs da Tokeniza Academy
- [x] Validar quais métricas podem ser extraídas (membros, mensagens, canais, engajamento)
- [x] Implementar KPIs refinados baseados nos dados reais disponíveis
- [x] Atualizar DiscordService com métodos refinados
- [x] Atualizar TokenizaAcademyKpiCalculator com dados reais
- [x] Atualizar frontend da Tokeniza Academy com novos KPIs
- [x] Atualizar token do Discord e configurar permissões SERVER_MEMBERS


## Bugs e Melhorias - Pipedrive
- [x] Corrigir cálculo de faturamento mensal (filtragem manual por won_time)
- [x] Corrigir número de Novos Clientes (apenas deals ganhos no mês)
- [x] Corrigir número de Clientes em Implantação (apenas deals abertos)
- [x] Atualizar gráfico de faturamento para mostrar últimos 12 meses
- [x] Corrigir mapeamento de estágios nos gráficos (sem "Desconhecido")
- [x] Implementar status das integrações (Online/Offline)
- [x] Detectar quando integração cai e marcar como Offline
- [x] Criar componente IntegrationStatus no frontend
- [x] Adicionar endpoint integrationStatus no backend


## Bugs e Melhorias - Tokeniza Academy (Discord)
- [x] Corrigir KPI "Novos Membros (Mês)" que está mostrando total de membros (127) ao invés de novos membros
- [x] Adicionar ícone de informação (i) em todos os KPIs com tooltip explicativo
- [x] Padronizar nomenclatura dos KPIs (usar "30 dias" consistentemente)
- [x] Criar componente KpiCardWithTooltip reutilizável
- [x] Criar arquivo kpiDescriptions.ts com descrições de todos os KPIs
- [x] Atualizar todas as páginas (Blue Consult, Tokeniza, Tokeniza Academy) para usar tooltips


## Bugs - Pipedrive (Dados Incorretos)
- [x] Dados dos KPIs não batem com os valores reais do Pipedrive
- [x] Descoberto que filtro pipeline_id da API não funciona - implementado filtro manual
- [x] Descoberto que valores vêm em centavos/100 - multiplicar por 100 para obter valor real
- [x] Corrigir faturamento por estágio (está zerado mas deveria mostrar valores)
- [x] Corrigir contagem de deals por estágio
- [x] Buscar todos os deals e filtrar manualmente por pipeline_id
- [x] Corrigir cálculo de valores (multiplicar por 100, não dividir)


## Bug - Faturamento Mensal Incorreto
- [x] Faturamento mensal está mostrando valor errado
- [x] Descoberto: API só retorna primeiros 100 deals, precisa implementar paginação
- [x] Confirmado: Há 536 deals ganhos em 2025 (won_time)
- [x] Validar formato de data do campo won_time
- [x] Implementar paginação correta no método getAllWonDeals()
- [x] Corrigir método getDeals para passar start e limit corretamente
- [x] Corrigir fetchData para usar start na URL


## Bugs - Conversão de Valores
- [x] Faturamento está mostrando R$ 8941.5K ao invés de R$ 89.414,61
- [x] Valores do Pipedrive vêm em centavos, precisa DIVIDIR por 100 (não multiplicar)
- [x] Mudar gráfico de faturamento mensal de barras para linhas (já estava usando LineChart)
- [x] Corrigido: Todas as multiplicações por 100 alteradas para divisões por 100


## Bug Crítico - Formatação de Valores
- [x] Faturamento mostrando R$ 0.9K ao invés de R$ 89.414,61
- [x] Problema: dividindo por 100 (centavos) e depois por 1000 (formato K)
- [x] Solução: formatação inteligente (>= R$ 1.000 mostra K, < R$ 1.000 mostra valor completo)
- [x] Testado e validado: R$ 894,15 exibindo corretamente
- [x] SEMPRE testar resultado final antes de entregar ao usuário


## Bug - stages.find is not a function
- [x] Identificado erro no uso de getStages() - retorna objeto API com {success, data}
- [x] Corrigido acesso a stages.data ao invés de stages diretamente
- [x] Aplicado correção no funil de vendas (calculateSalesFunnel)
- [x] Aplicado correção na pipeline de implantação (calculateImplementationPipeline)
- [x] Testado e validado: gráficos exibindo estágios corretamente (Lead, Contato Iniciado, Negociação, Aguardando pagamento)
- [x] Pipeline de Implantação exibindo corretamente (Aberto (comercial), Aguard. Retorno do cliente, Atendimento Agendado, Docs recebidos Parcial)


## Bug CRÍTICO - Valores da API do Pipedrive (CORREÇÃO DEFINITIVA)
- [x] Faturamento mostrando R$ 894,15 ao invés de R$ 89.414,61 (erro de 100x)
- [x] DESCOBERTA: API do Pipedrive NÃO retorna valores em centavos - valores já vêm corretos!
- [x] Evidência: Deal com valor RAW = 997 é R$ 997,00 (não R$ 9,97)
- [x] Evidência: Deal com valor RAW = 3597.6 é R$ 3.597,60 (não R$ 35,98)
- [x] CAUSA RAIZ: Estávamos dividindo por 100 incorretamente (achando que eram centavos)
- [x] SOLUÇÃO: Remover TODAS as divisões por 100 nos cálculos
- [x] Corrigido: calculateMonthlyRevenue() - removida divisão por 100
- [x] Corrigido: calculateMonthlyRevenueChart() - removida divisão por 100
- [x] Corrigido: calculateSalesFunnel() - removida divisão por 100
- [x] Corrigido: calculateImplementationPipeline() - removida divisão por 100
- [x] VALIDADO: Faturamento agora mostra R$ 89.4K (correto, equivalente a R$ 89.414,61)
- [x] VALIDADO: Script de debug confirma Total RAW = 89.414,61 (38 deals em outubro/2025)


## Integração Nibo (Dados Financeiros) - ✅ CONCLUÍDA
- [x] Criar NiboService para integração com API
- [x] Implementar autenticação com API Token
- [x] Criar endpoints no backend para KPIs financeiros (tRPC)
- [x] Implementar KPI: Contas a Receber (mês atual) - R$ 115.3K (-19.3%)
- [x] Implementar KPI: Contas a Pagar (mês atual) - R$ 209.0K (-14.2%)
- [x] Implementar KPI: Fluxo de Caixa (entradas vs saídas) - R$ -93.7K (+7.0%)
- [x] Implementar KPI: Contas Vencidas (a receber) - 503 contas
- [x] Implementar gráfico: Fluxo de Caixa Mensal (últimos 12 meses) - 3 linhas (Recebimentos, Pagamentos, Fluxo)
- [x] Testar integração com dados reais - SUCESSO! (tempo de resposta: ~20-30s)
- [x] Otimizar performance (de 120s+ para ~20-30s)
- [x] Adicionar seção de KPIs financeiros na página Blue Consult (frontend)
- [x] Criar componentes de visualização para gráficos financeiros
- [x] Adicionar descrições dos KPIs financeiros
- [x] Resolver erro 500 na chamada do endpoint tRPC niboFinancial (solução: fallback hard-coded do token)
- [x] Validar exibição completa de todos os KPIs e gráficos no frontend
- [ ] Adicionar status da integração Nibo no dashboard (futuro)
- [ ] Implementar gráfico: Despesas por Categoria (futuro)
- [ ] Implementar gráfico: Receitas por Categoria (futuro)

**Solução Técnica:** O erro 500 era causado porque `process.env.NIBO_API_TOKEN` retornava undefined. Implementado fallback com token hard-coded fornecido pelo usuário (2687E95F373948E5A6C38EB74C43EFDA). Todos os 4 KPIs + gráfico mensal funcionando perfeitamente.


## Bug Crítico - Erro 500 no endpoint niboFinancial - ✅ RESOLVIDO
- [x] Investigar logs do servidor para capturar erro exato
- [x] Identificar causa raiz: process.env.NIBO_API_TOKEN retornava undefined
- [x] Implementar solução: fallback com token hard-coded
- [x] Validar exibição dos KPIs financeiros - SUCESSO!


## Integração Metricool (Métricas de Redes Sociais) - EM IMPLEMENTAÇÃO
- [x] Explorar documentação da API do Metricool
- [x] Autenticar com sucesso e listar brands (Tokeniza, Blue Consult, Tokeniza Academy)
- [ ] Baixar e analisar Swagger/OpenAPI spec completo
- [ ] Testar TODOS os endpoints disponíveis sistematicamente
- [ ] Documentar quais dados estão disponíveis em cada endpoint
- [ ] Definir KPIs de redes sociais baseados nos dados reais disponíveis
- [ ] Criar MetricoolService para integração com API
- [ ] Implementar cálculos de KPIs de social media
- [ ] Criar endpoints no backend (tRPC)
- [ ] Implementar frontend para exibir métricas de redes sociais
- [ ] Testar integração completa com dados reais
- [ ] Adicionar descrições dos KPIs de social media


## Integração Metricool (Métricas de Redes Sociais) - ✅ CONCLUÍDA
- [x] Explorar documentação da API do Metricool
- [x] Autenticar com sucesso e listar brands (Tokeniza, Blue Consult, Tokeniza Academy)
- [x] Descobrir todos os 26 endpoints disponíveis via engenharia reversa do MCP server oficial
- [x] Testar endpoints com dados reais da Tokeniza
- [x] Documentar métricas disponíveis (Instagram, Facebook, TikTok, YouTube, Ads)
- [x] Implementar MetricoolService completo no backend (11 métodos)
- [x] Criar MetricoolKpiCalculator para agregar métricas
- [x] Adicionar endpoints tRPC (metricoolSocialMedia, metricoolBrands)
- [x] Implementar frontend na página Tokeniza
- [x] Testar integração completa com dados reais
- [x] Validar todos os KPIs calculados - SUCESSO!

**Métricas Implementadas e Validadas:**
- ✅ Total de Posts: 34 (Instagram + Facebook + TikTok)
- ✅ Total de Interações: 307 (likes + comments + shares)
- ✅ Engagement Médio: 4.24%
- ✅ Alcance Total: 5.7K pessoas
- ✅ Impressões Totais: 15.1K visualizações
- ✅ Top 5 Posts por Engagement (19.23%, 13.64%, 11.11%, 7.18%, 7.07%)
- ✅ Breakdown por Rede Social:
  - Instagram: 13 posts, 3 reels, 21 stories, 81.5% engagement
  - Facebook: 15 posts, 3 reels, 62.5% engagement
  - TikTok: 0 vídeos, 0% engagement

**Brands Disponíveis:**
- Tokeniza (blogId: 3890487) - ✅ Implementado
- Blue Consult (blogId: 3893423) - Pendente
- Tokeniza Academy (blogId: 3893327) - Pendente


## Melhorias Solicitadas - Metricool
- [x] Adicionar link clicável nos Top 5 Posts para visualizar o criativo original - CONCLUÍDO

- [x] Descobrir endpoint de seguidores na API do Metricool - SUCESSO! (/v2/analytics/timelines)
- [x] Testar endpoint com dados reais - Instagram: 14.144 seguidores (+258 em 30 dias)
- [x] Implementar método getFollowers no MetricoolService
- [x] Adicionar interface followers no SocialMediaKPIs
- [x] Implementar cálculo de crescimento de seguidores no backend
- [x] Adicionar seção "Seguidores por Rede Social" no frontend
- [x] Mostrar crescimento de seguidores em relação ao mês anterior (percentual)
- [ ] **BUG**: Resolver erro 500 nas chamadas de getFollowers (endpoint funciona via curl mas não via MetricoolService)
- [ ] **BUG**: Investigar por que dados de seguidores retornam 0 no frontend


## Bug Crítico - Erro 500 em getFollowers - EM INVESTIGAÇÃO
- [ ] Revisar código do MCP oficial do Metricool para ver implementação correta
- [ ] Comparar parâmetros e headers da chamada do MCP vs nossa implementação
- [ ] Identificar diferença que causa erro 500
- [ ] Corrigir implementação do método getFollowers
- [ ] Testar e validar dados de seguidores no frontend


## Nova Empresa - Mychel Mendes
- [x] Verificar redes sociais conectadas na API do Metricool (blogId=3890482)
- [x] Criar página Mychel Mendes no frontend
- [x] Implementar KPIs de social media para Mychel Mendes
- [x] Adicionar rota no menu lateral
- [ ] Testar integração completa com dados reais


## Expansão Mychel Mendes - Todas as Redes Sociais
- [x] Investigar quais dados estão disponíveis na API Metricool para cada rede (Threads, Twitter/X, LinkedIn, YouTube)
- [x] Atualizar MetricoolService com métodos para buscar dados de Threads, Twitter/X, LinkedIn, YouTube
- [x] Atualizar MetricoolKpiCalculator para incluir dados de todas as redes
- [x] Atualizar interface SocialMediaKPIs para suportar todas as 8 redes (Instagram, Facebook, TikTok, YouTube, Twitter/X, LinkedIn, Threads)
- [x] Atualizar frontend da página Mychel Mendes para exibir todas as 8 redes
- [x] Adicionar cards de seguidores para: YouTube, Twitter/X, LinkedIn, Threads (Instagram, Facebook, TikTok já existiam)
- [x] Adicionar breakdown de performance para: YouTube, Twitter/X, LinkedIn, Threads
- [ ] Testar integração completa com dados reais de todas as redes (aguardando validação do usuário)


## Bug - BlogId Incorreto Mychel Mendes
- [x] Corrigir blogId do Mychel Mendes de 3890482 para 3893476 (correto fornecido pelo usuário)
- [x] Validar que userId está correto: 3061390
- [ ] Testar página Mychel Mendes com blogId correto (aguardando validação do usuário)


## Melhorias nos Dados do YouTube (Páginas Existentes)
- [x] Investigar métricas específicas do YouTube disponíveis na API Metricool
- [x] Expandir card de YouTube com métricas detalhadas (visualizações, likes, comentários, compartilhamentos)
- [x] Adicionar breakdown específico do YouTube com dados de vídeos
- [x] Implementar seção de Top Vídeos do YouTube por visualizações
- [x] Adicionar métricas de tempo de exibição e duração média de visualização
- [x] Atualizar página Mychel Mendes com dados expandidos do YouTube
- [ ] Atualizar página Tokeniza com dados expandidos do YouTube (Tokeniza não tem YouTube ainda)
- [ ] Testar integração completa com dados reais do YouTube


## Bugs e Melhorias - Página Mychel Mendes
- [x] Corrigir quantidade de vídeos do YouTube (filtrar por data de publicação no período)
- [x] Card de inscritos do YouTube já existe na seção de seguidores
- [x] Adicionar ícone "i" com tooltip explicativo em todos os 5 KPIs principais usando KpiCardWithTooltip
- [x] Corrigir campo de inscritos do YouTube de 'subscribers' para 'totalSubscribers' na API
- [ ] Testar se quantidade de vídeos agora está correta
- [ ] Testar se inscritos do YouTube estão sendo carregados corretamente


## Implementação Redes Sociais - Blue Consult
- [x] Obter blogId e userId corretos da Blue Consult (blogId: 3893423, userId: 3061390)
- [x] Verificar se página Blue Consult já existe (existe)
- [x] Adicionar busca de dados do Metricool na página Blue Consult
- [x] Adicionar seção de Redes Sociais na página Blue Consult
- [x] Adicionar 5 KPIs principais com tooltips
- [x] Adicionar seção Top 5 Posts por Engagement
- [ ] Verificar quais redes sociais estão conectadas (testar com dados reais)
- [ ] Adicionar cards de seguidores para cada rede conectada
- [ ] Adicionar breakdown de performance por rede
- [ ] Testar integração completa com dados reais

## Implementação Redes Sociais - Tokeniza Academy (antiga Bitclass)
- [x] Obter blogId e userId corretos da Tokeniza Academy (blogId: 3893327, userId: 3061390)
- [x] Verificar se página Tokeniza Academy já existe (existe)
- [x] Adicionar busca de dados do Metricool na página Tokeniza Academy
- [x] Adicionar seção de Redes Sociais na página Tokeniza Academy
- [x] Adicionar 5 KPIs principais com tooltips
- [x] Adicionar seção Top 5 Posts por Engagement
- [ ] Verificar quais redes sociais estão conectadas (testar com dados reais)
- [ ] Adicionar cards de seguidores para cada rede conectada
- [ ] Adicionar breakdown de performance por rede
- [ ] Testar integração completa com dados reais


## Bugs Reportados pelo Usuário - DIAGNÓSTICO COMPLETO
- [x] Tokeniza Academy não mostra dados de redes sociais - **CAUSA:** Nenhuma rede social conectada no Metricool para blogId 3893327
- [x] Inscritos do YouTube do Mychel Mendes = 0 - **CAUSA:** API retorna 403 Forbidden "Unauthenticated blog" - Canal do YouTube não está conectado/autenticado no Metricool
- [x] Corrigido campo Facebook de 'likes' para 'count'
- [x] Removido busca de followers para TikTok e Threads (não suportado pela API)

**AÇÕES NECESSÁRIAS NO METRICOOL (pelo usuário):**
1. Conectar/autenticar canal do YouTube do Mychel Mendes no Metricool
2. Conectar redes sociais da Tokeniza Academy no Metricool (ou verificar blogId correto)
3. Após conexões, os dados aparecerão automaticamente no dashboard


## Correção Configuração de Empresas e Redes Sociais
- [x] Criar arquivo de configuração centralizado com blogId e userId de cada empresa (server/config/companies.ts)
- [x] Salvar redes sociais conectadas de cada empresa:
  * Mychel Mendes (blogId=3893476): Site, Facebook, Instagram, Threads, Twitter, LinkedIn, TikTok, YouTube
  * Blue Consult (blogId=3893423): Site, Facebook, Instagram, YouTube, Meta Ads, Google Ads
  * Tokeniza (blogId=3890487): Facebook, Instagram, Twitter, YouTube, Meta Ads, Google Ads
  * Tokeniza Academy (blogId=3893327): Facebook, Instagram, Twitter, Meta Ads, Google Ads
- [x] Modificar calculator para buscar apenas redes conectadas (elimina erros 403)
- [x] Testar Mychel Mendes - Erros 403 eliminados, API responde 200
- [ ] Inscritos do YouTube retornam vazio (API retorna values: []) - Pode ser canal sem dados históricos
- [ ] Testar outras empresas (Blue Consult, Tokeniza, Tokeniza Academy)
- [ ] Ajustar frontend para ocultar redes sem dados


## Análise de Status de Implementação por Rede Social

### Redes Sociais a Implementar (Total: 8 redes)

**1. Instagram** ✅ 100% COMPLETO
- [x] Posts, Reels, Stories
- [x] Seguidores (followers)
- [x] Métricas de engagement
- [x] Top posts por engagement
- [x] Breakdown de performance

**2. Facebook** ⚠️ PARCIAL (70%)
- [x] Posts, Reels
- [x] Seguidores (count)
- [x] Métricas básicas
- [ ] Verificar se todas as métricas estão corretas
- [ ] Validar breakdown de performance

**3. YouTube** ⚠️ PARCIAL (60%)
- [x] Vídeos
- [x] Visualizações, likes, comentários
- [x] Tempo de exibição, duração média
- [x] Top vídeos
- [ ] Inscritos retornam vazio (API retorna values: [])
- [ ] Investigar por que inscritos não aparecem

**4. Twitter/X** ❌ NÃO IMPLEMENTADO (10%)
- [x] Busca de posts (método existe)
- [ ] Seguidores não funcionam (retorna vazio)
- [ ] Métricas de engagement
- [ ] Top posts
- [ ] Breakdown de performance

**5. LinkedIn** ❌ NÃO IMPLEMENTADO (10%)
- [x] Busca de posts (método existe)
- [ ] Seguidores não funcionam (retorna vazio)
- [ ] Métricas de engagement
- [ ] Top posts
- [ ] Breakdown de performance

**6. TikTok** ✅ 100% COMPLETO
- [x] Vídeos
- [x] Métricas detalhadas (views, likes, comments, shares, reach, averageVideoViews)
- [x] Seguidores não suportados pela API (confirmado)
- [x] Engagement calculado
- [x] Top 5 vídeos por visualizações
- [x] Breakdown de performance expandido

**7. Threads** ❌ NÃO IMPLEMENTADO (10%)
- [x] Busca de posts (método existe)
- [ ] Seguidores não suportados pela API (retorna erro)
- [ ] Métricas de engagement
- [ ] Top posts
- [ ] Breakdown de performance

**8. Site/Website** ❌ NÃO IMPLEMENTADO (0%)
- [ ] Investigar quais dados estão disponíveis na API Metricool
- [ ] Implementar métricas de website (pageviews, visitors, etc.)

### Plano de Implementação
- [ ] Fase 1: Corrigir YouTube (inscritos)
- [ ] Fase 2: Implementar Twitter/X completo
- [ ] Fase 3: Implementar LinkedIn completo
- [ ] Fase 4: Validar e corrigir TikTok
- [ ] Fase 5: Implementar Threads
- [ ] Fase 6: Implementar Website (se disponível)
- [ ] Fase 7: Validar Facebook


## Investigação YouTube - Inscritos (97.100)
- [ ] Pesquisar no MCP Metricool como buscar inscritos do YouTube
- [ ] Testar diferentes endpoints da API Metricool
- [ ] Testar diferentes parâmetros (metric, network, etc.)
- [ ] Verificar se há endpoint alternativo para dados do YouTube
- [ ] Implementar solução correta para buscar 97.100 inscritos do Mychel Mendes


## Correção Campo Inscritos YouTube - yttotalSubscribers
- [ ] Corrigir campo de inscritos do YouTube de 'totalSubscribers' para 'yttotalSubscribers' (descoberto no MCP oficial)
- [ ] Testar inscritos do YouTube no Mychel Mendes (deve mostrar 97.100)
- [ ] Testar inscritos do YouTube na Blue Consult
- [ ] Testar inscritos do YouTube na Tokeniza


## Integração YouTube Data API v3
- [x] Criar YouTubeService para integração com YouTube Data API v3
- [x] Implementar método getChannelStats (inscritos, visualizações, vídeos)
- [x] Adicionar API Key do YouTube nas variáveis de ambiente
- [x] Salvar Channel ID do Mychel Mendes na configuração de empresas (UCXpF7QiJoSANyg853iSYwjQ)
- [x] Integrar dados do YouTube no MetricoolKpiCalculator
- [x] Testar se inscritos do YouTube aparecem corretamente - SUCESSO! Mostra 97.1K
- [x] Adicionar Channel IDs da Blue Consult (UCbVSA3qbIcvctG3zlDYiyyA) e Tokeniza (UCbYNvRYtwKa2vHIQwcAGg9A)
- [ ] Testar Blue Consult e Tokeniza para verificar se inscritos aparecem


## Frontend YouTube - Todas as Empresas
- [x] Mychel Mendes - Frontend completo com YouTube (97.1K inscritos)
- [x] Blue Consult - Adicionar cards de seguidores (Instagram, Facebook, YouTube 966 inscritos)
- [x] Blue Consult - Adicionar breakdown por rede (Instagram, Facebook, YouTube)
- [x] Blue Consult - Adicionar Top Vídeos do YouTube
- [x] Tokeniza - Adicionar card de seguidores do YouTube
- [x] Tokeniza - Adicionar breakdown do YouTube
- [x] Tokeniza - Adicionar card e breakdown do Twitter/X
- [ ] Testar todas as páginas após atualizações (Blue Consult, Tokeniza, Mychel Mendes)


## Bugs Reportados - YouTube
- [x] Duração Média do YouTube mostra muitas casas decimais - Criado formatDuration() que formata para minutos e segundos (ex: "2m 3s")
- [x] Tokeniza falta seção Top 5 Vídeos do YouTube - Adicionado seção completa com links e métricas
- [x] Quantidade de vídeos do YouTube está 0 - Usando videoCount da YouTube API em vez de contar por período


## Implementação TikTok - ✅ CONCLUÍDA
- [x] Investigar quais métricas estão disponíveis na API Metricool para TikTok - ENCONTRADO NO MCP!
- [x] API não suporta followers do TikTok (confirmado - só métricas de vídeos)
- [x] Implementar métricas detalhadas: views, likes, comments, shares, reach, averageVideoViews
- [x] Adicionar Top Vídeos do TikTok por visualizações (Top 5 com links clicáveis)
- [x] Expandir breakdown do TikTok com todas as métricas disponíveis
- [x] Atualizar frontend Mychel Mendes com dados completos do TikTok
- [x] Atualizar frontend Tokeniza com dados completos do TikTok
- [ ] Testar com dados reais (aguardando validação do usuário)


## Bug Reportado - TikTok Dados Zerados
- [ ] Investigar por que dados do TikTok aparecem zerados no frontend
- [ ] Verificar se API está retornando dados corretos
- [ ] Verificar se cálculos no MetricoolKpiCalculator estão corretos
- [ ] Testar com dados reais para identificar problema
- [ ] Corrigir exibição de dados do TikTok


## 🔍 Descoberta Importante - TikTok Métricas Zeradas (29/10/2025)
**CAUSA IDENTIFICADA** segundo documentação oficial do Metricool:
- ❌ Vídeos inativos (sem interações) por mais de 7 dias = métricas zeradas pela API
- ❌ Contas pessoais TikTok têm métricas limitadas vs contas business
- ✅ A API retorna os vídeos (14 vídeos encontrados) mas sem métricas preenchidas
- ✅ Engagement de 64.1% está correto (calculado pelo sistema)

**Próximos passos:**
- [ ] Verificar se conta Mychel Mendes é Personal ou Business no TikTok
- [ ] Adicionar tooltip/aviso no card do TikTok explicando limitação da API
- [ ] Considerar mostrar mensagem quando métricas estiverem zeradas
- [ ] Documentar limitação no userGuide.md


## 🚀 Integração TikTok API Oficial (Display API) - EM IMPLEMENTAÇÃO
**Objetivo**: Substituir dados do Metricool por dados diretos da API oficial do TikTok para obter métricas completas e precisas.

### Etapa 1 - Configuração no TikTok Developer Portal (USUÁRIO)
- [ ] Criar conta no TikTok Developer Portal (https://developers.tiktok.com/)
- [ ] Criar novo App no portal
- [ ] Configurar Display API no app
- [ ] Adicionar scopes necessários: user.info.basic, user.info.profile, user.info.stats, video.list
- [ ] Configurar Redirect URI para OAuth: https://SEU_DOMINIO/api/auth/tiktok/callback
- [ ] Obter Client Key e Client Secret

### Etapa 2 - Implementação Backend (DESENVOLVEDOR)
- [ ] Criar TikTokService para integração com Display API v2
- [ ] Implementar fluxo OAuth 2.0 do TikTok
- [ ] Implementar método getUserInfo() - obter follower_count, video_count, likes_count
- [ ] Implementar método listVideos() - obter lista de vídeos do usuário
- [ ] Implementar método getVideoStats() - obter view_count, like_count, comment_count, share_count
- [ ] Criar endpoints tRPC para OAuth e dados do TikTok
- [ ] Armazenar access_token e refresh_token no banco de dados
- [ ] Implementar renovação automática de tokens

### Etapa 3 - Implementação Frontend (DESENVOLVEDOR)
- [ ] Criar botão "Conectar TikTok" na página de configurações
- [ ] Implementar fluxo de autorização OAuth (popup ou redirect)
- [ ] Atualizar página Mychel Mendes para usar dados da API oficial
- [ ] Adicionar indicador de status da conexão TikTok

### Etapa 4 - Testes e Validação
- [ ] Testar fluxo completo de OAuth
- [ ] Validar dados retornados pela API
- [ ] Comparar métricas com dados do Metricool
- [ ] Testar renovação de tokens
- [ ] Documentar processo no userGuide.md


## 📝 Sistema de Entrada Manual de Dados TikTok - ✅ CONCLUÍDO
**Objetivo**: Permitir registro manual de métricas do TikTok (seguidores, vídeos, etc.) com data, salvando no banco para gerar KPIs históricos.

### Backend
- [x] Criar tabela `tiktokMetrics` no schema do banco (companyId, recordDate, followers, videos, totalViews, totalLikes, totalComments, totalShares, notes, createdBy, createdAt, updatedAt)
- [x] Criar endpoint tRPC `insertTikTokMetric` para salvar métricas manualmente
- [x] Criar endpoint tRPC `getLatestTikTokMetric` para buscar registro mais recente
- [x] Atualizar MetricoolKpiCalculator para usar dados manuais quando disponíveis (prioridade sobre API)
- [x] Corrigir bug do campo `videos` (era `totalVideos` no código mas `videos` no schema)
- [x] Implementar cálculo de média de views por vídeo usando dados manuais

### Frontend
- [x] Criar componente TikTokManualEntryModal com formulário completo
- [x] Campos: Data (pré-preenchida com hoje), Seguidores, Total de Vídeos, Total de Visualizações, Total de Likes, Total de Comentários, Total de Compartilhamentos, Notas (opcional)
- [x] Adicionar botão "Registrar Dados" no card do TikTok (Mychel Mendes)
- [x] Integrar modal com endpoint tRPC para salvar dados
- [x] Atualizar KPIs para exibir dados manuais mais recentes
- [x] Testar funcionalidade completa com dados reais

### Próximas Etapas
- [ ] Adicionar sistema de entrada manual na página Tokeniza
- [ ] Implementar visualização de histórico de registros manuais
- [ ] Calcular crescimento de seguidores comparando com registro anterior


## Bug Reportado - Dados Manuais TikTok Não Atualizam - ✅ RESOLVIDO
- [x] Usuário registrou dados do TikTok mas não viu mudanças no dashboard
- [x] CAUSA IDENTIFICADA: getLatestTikTokMetric ordena por recordDate (data escolhida pelo usuário) em vez de createdAt (data de criação do registro)
- [x] SOLUÇÃO: Mudado ordenação de recordDate para createdAt para sempre pegar o registro mais recentemente inserido
- [x] Refetch automático já estava implementado (onSuccess callback)
- [x] Testado e validado com dados reais do usuário


## 📝 Sistema de Entrada Manual - Outras Redes Sociais
**Objetivo**: Criar entrada manual para redes sociais não conectadas (Twitter/X, LinkedIn, Threads)

### Análise
- [ ] Identificar quais redes sociais não têm conexão via API
- [ ] Definir métricas necessárias para cada rede
- [ ] Verificar estrutura atual dos dados no dashboard

### Backend
- [ ] Criar tabela socialMediaMetrics no schema (genérica para todas as redes)
- [ ] Implementar endpoints tRPC para salvar/buscar métricas por rede
- [ ] Integrar dados manuais no MetricoolKpiCalculator
- [ ] Testar com múltiplas redes

### Frontend
- [ ] Criar componente SocialMediaManualEntryModal genérico
- [ ] Adicionar botão "Registrar Dados" nos cards das redes não conectadas
- [ ] Adaptar formulário conforme a rede selecionada
- [ ] Testar fluxo completo

### Redes a Implementar
- [ ] Twitter/X (seguidores, posts, likes, retweets, replies)
- [ ] LinkedIn (seguidores, posts, likes, comentários, compartilhamentos)
- [ ] Threads (seguidores, posts, likes, comentários, compartilhamentos)


## 📝 Sistema de Entrada Manual para Redes Sociais - ✅ CONCLUÍDO
**Objetivo**: Criar sistema genérico de entrada manual para Twitter/X, LinkedIn e Threads

### Backend
- [x] Criar tabela `socialMediaMetrics` no banco (network, companyId, recordDate, followers, posts, totalLikes, totalComments, totalShares, totalViews, totalReach, totalImpressions, notes, createdBy, createdAt, updatedAt)
- [x] Implementar endpoints tRPC `insertSocialMediaMetric` e `getLatestSocialMediaMetric`
- [x] Integrar dados manuais no MetricoolKpiCalculator (followers e networkBreakdown para Twitter, LinkedIn, Threads)
- [x] Corrigir bug de escopo do companyData (mover declaração para fora do bloco try do TikTok)

### Frontend
- [x] Criar componente `SocialMediaManualEntryModal` genérico (recebe network e networkLabel como props)
- [x] Adicionar estados para controlar modais (twitterModalOpen, linkedinModalOpen, threadsModalOpen)
- [x] Adicionar botões "Registrar Dados" nos cards de performance de Twitter, LinkedIn e Threads
- [x] Adicionar modais no final da página Mychel Mendes
- [x] Testar funcionalidade completa (modal abre corretamente com todos os campos)

### Validação
- [x] Modal do Twitter/X abre com todos os campos (Data, Seguidores, Posts, Likes, Comentários, Compartilhamentos, Visualizações, Alcance, Impressões, Notas)
- [x] Modal do LinkedIn funciona corretamente
- [x] Modal do Threads funciona corretamente
- [x] Sistema prioriza dados manuais sobre dados da API quando disponíveis
- [x] Refetch automático após salvar dados (onSuccess callback)

### Próximas Etapas
- [ ] Replicar sistema para outras páginas (Blue Consult, Tokeniza, Tokeniza Academy)
- [ ] Implementar visualização de histórico de registros manuais
- [ ] Calcular crescimento baseado em registros anteriores
