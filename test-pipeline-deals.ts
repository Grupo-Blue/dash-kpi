const PIPEDRIVE_API_TOKEN = '87820d5cbb1503e4ebe161c986d16ebe3a1ac572';
const baseUrl = 'https://api.pipedrive.com/v1';

async function testPipelineDeals() {
  try {
    // Buscar Pipeline de Vendas (ID: 5)
    const url = `${baseUrl}/deals?api_token=${PIPEDRIVE_API_TOKEN}&pipeline_id=5&status=open&limit=5`;
    
    console.log('Buscando deals da Pipeline de Vendas (ID: 5)...\n');
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success && data.data) {
      console.log(`Total de deals encontrados: ${data.data.length}`);
      console.log('\nPrimeiro deal como exemplo:');
      const firstDeal = data.data[0];
      console.log(JSON.stringify({
        id: firstDeal.id,
        title: firstDeal.title,
        value: firstDeal.value,
        currency: firstDeal.currency,
        stage_id: firstDeal.stage_id,
        pipeline_id: firstDeal.pipeline_id,
        status: firstDeal.status,
      }, null, 2));
      
      // Agrupar por stage_id
      const byStage: Record<number, { count: number; total: number }> = {};
      data.data.forEach((deal: any) => {
        const stageId = deal.stage_id;
        if (!byStage[stageId]) {
          byStage[stageId] = { count: 0, total: 0 };
        }
        byStage[stageId].count++;
        byStage[stageId].total += deal.value || 0;
      });
      
      console.log('\nAgrupado por estágio:');
      console.log(JSON.stringify(byStage, null, 2));
    } else {
      console.error('Erro:', data);
    }
  } catch (error) {
    console.error('Erro ao buscar deals:', error);
  }
}

testPipelineDeals();
