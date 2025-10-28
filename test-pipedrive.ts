import { PipedriveService } from './server/services/integrations';

const PIPEDRIVE_TOKEN = process.env.PIPEDRIVE_API_TOKEN || '87820d5cbb1503e4ebe161c986d16ebe3a1ac572';

async function testPipedrive() {
  console.log('🔍 Testando conexão com Pipedrive...\n');
  
  const service = new PipedriveService(PIPEDRIVE_TOKEN);
  
  // Test 1: Connection
  console.log('1️⃣ Teste de Conexão:');
  const connected = await service.testConnection();
  console.log(`   Status: ${connected ? '✅ Conectado' : '❌ Falha'}\n`);
  
  if (!connected) {
    console.log('❌ Não foi possível conectar ao Pipedrive. Verifique o token.');
    return;
  }
  
  // Test 2: Get all pipelines
  console.log('2️⃣ Buscando Pipelines:');
  const pipelines = await service.getAllPipelines();
  console.log(`   Total de pipelines: ${pipelines.data?.length || 0}`);
  pipelines.data?.forEach((p: any) => {
    console.log(`   - ${p.name} (ID: ${p.id})`);
  });
  console.log('');
  
  // Test 3: Find specific pipelines
  console.log('3️⃣ Buscando Pipelines Específicas:');
  const salesPipeline = await service.getPipelineByName('Blue - Pipeline de Vendas');
  const implPipeline = await service.getPipelineByName('Blue - Pipeline Implantação');
  
  console.log(`   Pipeline de Vendas: ${salesPipeline ? `✅ Encontrada (ID: ${salesPipeline.id})` : '❌ Não encontrada'}`);
  console.log(`   Pipeline de Implantação: ${implPipeline ? `✅ Encontrada (ID: ${implPipeline.id})` : '❌ Não encontrada'}\n`);
  
  if (!salesPipeline) {
    console.log('⚠️  Pipeline de Vendas não encontrada. Nomes disponíveis:');
    pipelines.data?.forEach((p: any) => console.log(`   - "${p.name}"`));
    return;
  }
  
  // Test 4: Get deals from sales pipeline
  console.log('4️⃣ Buscando Deals da Pipeline de Vendas:');
  const deals = await service.getDeals({ pipeline_id: salesPipeline.id, limit: 10 });
  console.log(`   Total de deals: ${deals.data?.length || 0}`);
  
  if (deals.data && deals.data.length > 0) {
    console.log(`   Exemplo de deal:`);
    const deal = deals.data[0];
    console.log(`   - Título: ${deal.title}`);
    console.log(`   - Valor: R$ ${deal.value}`);
    console.log(`   - Status: ${deal.status}`);
    console.log(`   - Stage ID: ${deal.stage_id}`);
  }
  console.log('');
  
  // Test 5: Get stages
  console.log('5️⃣ Buscando Estágios da Pipeline de Vendas:');
  const stages = await service.getStages(salesPipeline.id);
  console.log(`   Total de estágios: ${stages.data?.length || 0}`);
  stages.data?.forEach((s: any) => {
    console.log(`   - ${s.name} (ID: ${s.id})`);
  });
  console.log('');
  
  // Test 6: Count deals by status
  console.log('6️⃣ Contagem de Deals por Status:');
  const allDeals = await service.getDeals({ pipeline_id: salesPipeline.id });
  const wonDeals = allDeals.data?.filter((d: any) => d.status === 'won') || [];
  const openDeals = allDeals.data?.filter((d: any) => d.status === 'open') || [];
  const lostDeals = allDeals.data?.filter((d: any) => d.status === 'lost') || [];
  
  console.log(`   Total: ${allDeals.data?.length || 0}`);
  console.log(`   Ganhos (won): ${wonDeals.length}`);
  console.log(`   Abertos (open): ${openDeals.length}`);
  console.log(`   Perdidos (lost): ${lostDeals.length}`);
  console.log('');
  
  console.log('✅ Teste concluído!');
}

testPipedrive().catch(console.error);
