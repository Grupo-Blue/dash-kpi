import { PipedriveService } from './server/services/integrations';

const PIPEDRIVE_API_TOKEN = '87820d5cbb1503e4ebe161c986d16ebe3a1ac572';

async function debugPipedrive() {
  console.log('🔍 Investigando dados do Pipedrive...\n');
  
  const service = new PipedriveService(PIPEDRIVE_API_TOKEN, {});
  
  try {
    // 1. Get pipelines
    console.log('1️⃣ Buscando pipelines...');
    const pipelinesResponse = await service.getAllPipelines();
    const allPipelines = pipelinesResponse.data || [];
    const salesPipeline = allPipelines.find((p: any) => p.name === 'Blue - Pipeline de Vendas');
    const implPipeline = allPipelines.find((p: any) => p.name === 'Blue - Implantação');
    
    console.log(`   Pipeline de Vendas: ID ${salesPipeline?.id}`);
    console.log(`   Pipeline de Implantação: ID ${implPipeline?.id}\n`);
    
    // 2. Get all deals from sales pipeline
    console.log('2️⃣ Analisando deals da Pipeline de Vendas...');
    const salesDealsResponse = await service.getDeals({ pipeline_id: salesPipeline.id });
    const salesDeals = salesDealsResponse.data || [];
    
    const wonDeals = salesDeals.filter((d: any) => d.status === 'won');
    const openDeals = salesDeals.filter((d: any) => d.status === 'open');
    const lostDeals = salesDeals.filter((d: any) => d.status === 'lost');
    
    console.log(`   Total de deals: ${salesDeals.length}`);
    console.log(`   Ganhos (won): ${wonDeals.length}`);
    console.log(`   Abertos (open): ${openDeals.length}`);
    console.log(`   Perdidos (lost): ${lostDeals.length}\n`);
    
    // 3. Analyze won deals by month
    console.log('3️⃣ Faturamento por mês (deals ganhos):');
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Group won deals by month
    const dealsByMonth: Record<string, any[]> = {};
    wonDeals.forEach((deal: any) => {
      if (deal.won_time) {
        const wonDate = new Date(deal.won_time);
        const monthKey = `${wonDate.getFullYear()}-${String(wonDate.getMonth() + 1).padStart(2, '0')}`;
        if (!dealsByMonth[monthKey]) {
          dealsByMonth[monthKey] = [];
        }
        dealsByMonth[monthKey].push(deal);
      }
    });
    
    // Show last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const deals = dealsByMonth[monthKey] || [];
      const revenue = deals.reduce((sum: number, d: any) => sum + (d.value || 0), 0);
      
      console.log(`   ${monthKey}: R$ ${revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${deals.length} deals)`);
    }
    console.log('');
    
    // 4. Current month details
    const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const currentMonthDeals = dealsByMonth[currentMonthKey] || [];
    const currentMonthRevenue = currentMonthDeals.reduce((sum: number, d: any) => sum + (d.value || 0), 0);
    
    console.log(`4️⃣ Detalhes do mês atual (${currentMonthKey}):`);
    console.log(`   Novos Clientes (deals ganhos): ${currentMonthDeals.length}`);
    console.log(`   Faturamento: R$ ${currentMonthRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`);
    
    // 5. Implementation pipeline
    console.log('5️⃣ Analisando Pipeline de Implantação...');
    const implDealsResponse = await service.getDeals({ pipeline_id: implPipeline.id });
    const implDeals = implDealsResponse.data || [];
    const activeImplDeals = implDeals.filter((d: any) => d.status === 'open');
    
    console.log(`   Total de deals: ${implDeals.length}`);
    console.log(`   Em implantação (abertos): ${activeImplDeals.length}\n`);
    
    // 6. Get stages for both pipelines
    console.log('6️⃣ Estágios das Pipelines:');
    const salesStagesResponse = await service.getStages(salesPipeline.id);
    const salesStages = salesStagesResponse.data || [];
    const implStagesResponse = await service.getStages(implPipeline.id);
    const implStages = implStagesResponse.data || [];
    
    console.log(`   Pipeline de Vendas (${salesStages.length} estágios):`);
    salesStages.forEach((s: any) => {
      const dealsInStage = openDeals.filter((d: any) => d.stage_id === s.id);
      console.log(`      - ${s.name} (ID: ${s.id}) - ${dealsInStage.length} deals`);
    });
    
    console.log(`\n   Pipeline de Implantação (${implStages.length} estágios):`);
    implStages.forEach((s: any) => {
      const dealsInStage = activeImplDeals.filter((d: any) => d.stage_id === s.id);
      console.log(`      - ${s.name} (ID: ${s.id}) - ${dealsInStage.length} deals`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

debugPipedrive();
