/**
 * Descrições dos KPIs para tooltips
 */

export const KPI_DESCRIPTIONS = {
  // Blue Consult
  'Faturamento Mensal': 'Soma total do valor de todos os deals ganhos (status "won") na Pipeline de Vendas no mês atual.',
  'Novos Clientes': 'Quantidade de deals fechados (status "won") na Pipeline de Vendas no mês atual.',
  'Clientes em Implantação': 'Número de clientes ativos (status "open") na Pipeline de Implantação (CS).',
  'Taxa de Conversão': 'Percentual de deals ganhos em relação ao total de deals criados na Pipeline de Vendas.',
  
  // Tokeniza
  'Ticket Médio': 'Valor médio dos investimentos realizados pelos investidores.',
  'Taxa de Retenção': 'Percentual de investidores que continuam ativos na plataforma.',
  'Investidores Inativos': 'Número de investidores que não realizaram investimentos recentemente.',
  'Último Investimento': 'Data do investimento mais recente realizado na plataforma.',
  'Valor Investido': 'Soma total de todos os investimentos realizados até hoje.',
  
  // Tokeniza Academy (Discord)
  'Total de Membros': 'Número total de membros no servidor Discord da Tokeniza Academy.',
  'Membros Online': 'Quantidade de membros atualmente online no Discord.',
  'Novos Membros (7 dias)': 'Membros que entraram no servidor Discord nos últimos 7 dias.',
  'Novos Membros (30 dias)': 'Membros que entraram no servidor Discord nos últimos 30 dias.',
  'Taxa de Atividade': 'Percentual de membros online em relação ao total de membros.',
  'Total de Canais': 'Número total de canais (texto e voz) no servidor Discord.',
  'Humanos': 'Número de membros humanos (excluindo bots) no servidor.',
  'Bots': 'Número de bots no servidor Discord.',
  
  // Nibo (Dados Financeiros)
  'Contas a Receber': 'Total de recebimentos agendados (a receber) para o mês atual, incluindo todas as contas com vencimento no período.',
  'Contas a Pagar': 'Total de pagamentos agendados (a pagar) para o mês atual, incluindo todas as contas com vencimento no período.',
  'Fluxo de Caixa': 'Diferença entre recebimentos e pagamentos do mês atual. Valor positivo indica superavit, negativo indica déficit.',
  'Contas Vencidas (Receber)': 'Número de contas a receber com vencimento anterior à data atual que ainda não foram quitadas.',
};

export function getKpiDescription(label: string): string | undefined {
  return KPI_DESCRIPTIONS[label as keyof typeof KPI_DESCRIPTIONS];
}
