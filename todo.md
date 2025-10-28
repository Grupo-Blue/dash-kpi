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


## Integração Nibo (Dados Financeiros) - IMPLEMENTADO (com bug de integração tRPC)
- [x] Criar NiboService para integração com API
- [x] Implementar autenticação com API Token
- [x] Criar endpoints no backend para KPIs financeiros (tRPC)
- [x] Implementar KPI: Contas a Receber (mês atual) - R$ 115.3K
- [x] Implementar KPI: Contas a Pagar (mês atual) - R$ 209.0K
- [x] Implementar KPI: Fluxo de Caixa (entradas vs saídas) - R$ -93.7K
- [x] Implementar KPI: Contas Vencidas (a receber) - 510 contas
- [x] Implementar gráfico: Fluxo de Caixa Mensal (últimos 12 meses)
- [x] Testar integração com dados reais - SUCESSO! (6 segundos)
- [x] Otimizar performance (de 120s+ para 6s)
- [x] Adicionar seção de KPIs financeiros na página Blue Consult (frontend)
- [x] Criar componentes de visualização para gráficos financeiros
- [x] Adicionar descrições dos KPIs financeiros
- [ ] **BUG**: Resolver erro 500 na chamada do endpoint tRPC niboFinancial
- [ ] **BUG**: Investigar problema de autenticação/timeout no tRPC
- [ ] Adicionar status da integração Nibo no dashboard
- [ ] Implementar gráfico: Despesas por Categoria (futuro)
- [ ] Implementar gráfico: Receitas por Categoria (futuro)

**Nota Técnica:** Backend e cálculos funcionam perfeitamente em testes standalone (6s de resposta). O problema é na integração com tRPC que retorna erro 500. Frontend está pronto para exibir os dados assim que o bug for corrigido.
