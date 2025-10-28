const PIPEDRIVE_API_TOKEN = '87820d5cbb1503e4ebe161c986d16ebe3a1ac572';
const baseUrl = 'https://api.pipedrive.com/v1';

async function getAllDeals() {
  try {
    let allDeals: any[] = [];
    let start = 0;
    const limit = 500;
    let hasMore = true;
    
    while (hasMore) {
      const url = `${baseUrl}/deals?api_token=${PIPEDRIVE_API_TOKEN}&status=open&start=${start}&limit=${limit}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.data) {
        allDeals = allDeals.concat(data.data);
        hasMore = data.additional_data?.pagination?.more_items_in_collection || false;
        start += limit;
      } else {
        break;
      }
    }
    
    console.log(`Total de deals abertos: ${allDeals.length}\n`);
    
    // Filtrar por pipeline 5 (Blue - Pipeline de Vendas)
    const pipeline5Deals = allDeals.filter(d => d.pipeline_id === 5);
    console.log(`Deals na Pipeline 5 (Blue - Pipeline de Vendas): ${pipeline5Deals.length}`);
    
    // Agrupar por estágio
    const byStage: Record<number, { count: number; total: number; name: string }> = {};
    pipeline5Deals.forEach((deal: any) => {
      const stageId = deal.stage_id;
      if (!byStage[stageId]) {
        byStage[stageId] = { count: 0, total: 0, name: deal.stage?.name || 'Unknown' };
      }
      byStage[stageId].count++;
      byStage[stageId].total += deal.value || 0;
    });
    
    console.log('\nPipeline de Vendas - Por Estágio:');
    Object.entries(byStage).forEach(([stageId, data]) => {
      console.log(`  Stage ${stageId} (${data.name}): R$ ${(data.total / 100).toFixed(2)} - ${data.count} deals`);
    });
    
    // Filtrar por pipeline 8 (Blue - Implantação)
    const pipeline8Deals = allDeals.filter(d => d.pipeline_id === 8);
    console.log(`\nDeals na Pipeline 8 (Blue - Implantação): ${pipeline8Deals.length}`);
    
    const byStage8: Record<number, { count: number; total: number; name: string }> = {};
    pipeline8Deals.forEach((deal: any) => {
      const stageId = deal.stage_id;
      if (!byStage8[stageId]) {
        byStage8[stageId] = { count: 0, total: 0, name: deal.stage?.name || 'Unknown' };
      }
      byStage8[stageId].count++;
      byStage8[stageId].total += deal.value || 0;
    });
    
    console.log('\nPipeline de Implantação - Por Estágio:');
    Object.entries(byStage8).forEach(([stageId, data]) => {
      console.log(`  Stage ${stageId} (${data.name}): R$ ${(data.total / 100).toFixed(2)} - ${data.count} deals`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

getAllDeals();
