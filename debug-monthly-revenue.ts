import { PipedriveService } from './server/services/integrations';

const PIPEDRIVE_API_TOKEN = process.env.PIPEDRIVE_API_TOKEN || '';

async function debugMonthlyRevenue() {
  const service = new PipedriveService(PIPEDRIVE_API_TOKEN);
  
  console.log('\n=== DEBUG: Faturamento Mensal de Outubro/2025 ===\n');
  
  // Buscar todos os deals ganhos
  let allDeals: any[] = [];
  let start = 0;
  const limit = 500;
  let hasMore = true;
  
  while (hasMore) {
    const response = await service.getDeals({
      status: 'won',
      start,
      limit,
    });
    
    if (response.success && response.data) {
      allDeals = allDeals.concat(response.data);
      hasMore = response.additional_data?.pagination?.more_items_in_collection || false;
      start += limit;
    } else {
      break;
    }
  }
  
  console.log(`Total de deals ganhos: ${allDeals.length}`);
  
  // Filtrar por pipeline de vendas (ID: 5)
  const salesDeals = allDeals.filter(d => d.pipeline_id === 5);
  console.log(`Deals da Pipeline de Vendas (ID: 5): ${salesDeals.length}`);
  
  // Filtrar por outubro/2025
  const octoberDeals = salesDeals.filter(d => {
    if (!d.won_time) return false;
    const wonDate = new Date(d.won_time);
    return wonDate.getFullYear() === 2025 && wonDate.getMonth() === 9; // Outubro = mês 9
  });
  
  console.log(`\nDeals ganhos em Outubro/2025: ${octoberDeals.length}`);
  
  if (octoberDeals.length > 0) {
    console.log('\n=== Primeiros 5 deals de Outubro/2025 ===');
    octoberDeals.slice(0, 5).forEach((deal, i) => {
      console.log(`\nDeal ${i + 1}:`);
      console.log(`  ID: ${deal.id}`);
      console.log(`  Título: ${deal.title}`);
      console.log(`  Valor RAW da API: ${deal.value}`);
      console.log(`  Valor ÷ 100: ${deal.value / 100}`);
      console.log(`  Won Time: ${deal.won_time}`);
    });
  }
  
  // Calcular total
  const totalRaw = octoberDeals.reduce((sum: number, d: any) => sum + (d.value || 0), 0);
  console.log(`\n=== TOTAIS ===`);
  console.log(`Total RAW (soma dos valores da API): ${totalRaw}`);
  console.log(`Total ÷ 100: ${totalRaw / 100}`);
  console.log(`Total ÷ 100 formatado: R$ ${(totalRaw / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
}

debugMonthlyRevenue().catch(console.error);
