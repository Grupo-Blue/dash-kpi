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
  
  // Home - KPIs Consolidados
  'Faturamento Total': 'Soma total do faturamento de todas as empresas do grupo (Pipedrive).',
  'Seguidores Totais': 'Soma de seguidores de todas as redes sociais de todas as empresas do grupo.',
  'Membros Discord': 'Total de membros no servidor Discord da Tokeniza Academy.',
  'Engajamento Médio': 'Taxa média de engajamento (interações/alcance) em todas as redes sociais do grupo.',
  'Receitas': 'Total de receitas (contas a receber) de todas as empresas do grupo (Nibo).',
  'Despesas': 'Total de despesas (contas a pagar) de todas as empresas do grupo (Nibo).',
  'Saldo': 'Diferença entre receitas e despesas. Valor positivo indica lucro, negativo indica prejuízo.',
  'Posts Totais': 'Soma de todos os posts publicados em todas as redes sociais do grupo.',
  'Alcance Total': 'Soma do alcance (pessoas únicas que viram o conteúdo) em todas as redes sociais.',
  'Interações Totais': 'Soma de todas as interações (curtidas, comentários, compartilhamentos) em todas as redes sociais.',
  
  // Redes Sociais - KPIs Gerais
  'Total de Posts': 'Número total de publicações realizadas em todas as redes sociais conectadas.',
  'Interações': 'Soma de curtidas, comentários, compartilhamentos e outras interações em todos os posts.',
  'Engagement Médio': 'Taxa média de engajamento calculada como (Interações / Alcance) × 100.',
  'Alcance Total': 'Número total de pessoas únicas que visualizaram o conteúdo publicado.',
  'Impressões': 'Número total de vezes que o conteúdo foi exibido (uma pessoa pode gerar múltiplas impressões).',
  
  // Redes Sociais - Métricas Específicas
  'totalPosts': 'Número total de publicações realizadas em todas as redes sociais conectadas.',
  'totalInteractions': 'Soma de curtidas, comentários, compartilhamentos e outras interações em todos os posts.',
  'averageEngagement': 'Taxa média de engajamento calculada como (Interações / Alcance) × 100.',
  'totalReach': 'Número total de pessoas únicas que visualizaram o conteúdo publicado.',
  'totalImpressions': 'Número total de vezes que o conteúdo foi exibido (uma pessoa pode gerar múltiplas impressões).',
  
  // Instagram
  'Seguidores Instagram': 'Número total de seguidores na conta do Instagram.',
  'Posts Instagram': 'Quantidade de posts publicados no Instagram no período.',
  'Curtidas Instagram': 'Total de curtidas recebidas nos posts do Instagram.',
  'Comentários Instagram': 'Total de comentários recebidos nos posts do Instagram.',
  'Alcance Instagram': 'Número de contas únicas que visualizaram o conteúdo do Instagram.',
  'Impressões Instagram': 'Número total de vezes que o conteúdo do Instagram foi visualizado.',
  
  // Facebook
  'Seguidores Facebook': 'Número total de pessoas que curtiram a página do Facebook.',
  'Posts Facebook': 'Quantidade de posts publicados no Facebook no período.',
  'Curtidas Facebook': 'Total de reações (curtidas, amei, etc.) nos posts do Facebook.',
  'Comentários Facebook': 'Total de comentários recebidos nos posts do Facebook.',
  'Compartilhamentos Facebook': 'Número de vezes que os posts foram compartilhados.',
  'Alcance Facebook': 'Número de pessoas únicas que visualizaram o conteúdo do Facebook.',
  
  // YouTube
  'Inscritos YouTube': 'Número total de inscritos no canal do YouTube.',
  'Vídeos YouTube': 'Quantidade de vídeos publicados no canal.',
  'Visualizações YouTube': 'Total de visualizações de todos os vídeos do canal.',
  'Tempo de Exibição YouTube': 'Tempo total (em horas) que os espectadores assistiram aos vídeos.',
  'Duração Média YouTube': 'Tempo médio de duração dos vídeos publicados.',
  'Curtidas YouTube': 'Total de curtidas recebidas nos vídeos.',
  'Comentários YouTube': 'Total de comentários recebidos nos vídeos.',
  
  // TikTok
  'Seguidores TikTok': 'Número total de seguidores na conta do TikTok.',
  'Vídeos TikTok': 'Quantidade de vídeos publicados no TikTok.',
  'Visualizações TikTok': 'Total de visualizações de todos os vídeos do TikTok.',
  'Curtidas TikTok': 'Total de curtidas recebidas nos vídeos do TikTok.',
  'Comentários TikTok': 'Total de comentários recebidos nos vídeos.',
  'Compartilhamentos TikTok': 'Número de vezes que os vídeos foram compartilhados.',
  'Alcance TikTok': 'Número de contas únicas que visualizaram os vídeos.',
  
  // Twitter/X
  'Seguidores Twitter': 'Número total de seguidores na conta do Twitter/X.',
  'Posts Twitter': 'Quantidade de tweets publicados no período.',
  'Curtidas Twitter': 'Total de curtidas recebidas nos tweets.',
  'Retweets': 'Número de vezes que os tweets foram retweetados.',
  'Respostas Twitter': 'Total de respostas recebidas nos tweets.',
  'Impressões Twitter': 'Número total de vezes que os tweets foram visualizados.',
  
  // LinkedIn
  'Seguidores LinkedIn': 'Número total de seguidores na página do LinkedIn.',
  'Posts LinkedIn': 'Quantidade de posts publicados no LinkedIn no período.',
  'Curtidas LinkedIn': 'Total de reações recebidas nos posts do LinkedIn.',
  'Comentários LinkedIn': 'Total de comentários recebidos nos posts.',
  'Compartilhamentos LinkedIn': 'Número de vezes que os posts foram compartilhados.',
  'Impressões LinkedIn': 'Número total de vezes que o conteúdo foi visualizado.',
  
  // Threads
  'Seguidores Threads': 'Número total de seguidores na conta do Threads.',
  'Posts Threads': 'Quantidade de threads publicados no período.',
  'Curtidas Threads': 'Total de curtidas recebidas nos threads.',
  'Respostas Threads': 'Total de respostas recebidas nos threads.',
  'Repostagens Threads': 'Número de vezes que os threads foram repostados.',
};

export function getKpiDescription(label: string): string | undefined {
  // Tenta buscar a descrição exata primeiro
  let description = KPI_DESCRIPTIONS[label as keyof typeof KPI_DESCRIPTIONS];
  
  // Se não encontrar, tenta remover sufixos comuns (Instagram, Facebook, etc.)
  if (!description) {
    const networks = ['Instagram', 'Facebook', 'YouTube', 'TikTok', 'Twitter', 'LinkedIn', 'Threads'];
    for (const network of networks) {
      if (label.includes(network)) {
        const baseLabel = label.replace(network, '').trim();
        description = KPI_DESCRIPTIONS[`${baseLabel} ${network}` as keyof typeof KPI_DESCRIPTIONS];
        if (description) break;
      }
    }
  }
  
  return description;
}
