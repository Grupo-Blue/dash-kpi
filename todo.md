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
