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
