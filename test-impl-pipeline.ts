import { PipedriveService } from './server/services/integrations';

const PIPEDRIVE_TOKEN = '87820d5cbb1503e4ebe161c986d16ebe3a1ac572';

async function test() {
  const service = new PipedriveService(PIPEDRIVE_TOKEN);
  
  console.log('Testando busca de "Blue - Implantação"...\n');
  
  const pipeline = await service.getPipelineByName('Blue - Implantação');
  
  if (pipeline) {
    console.log(`✅ Encontrada! ID: ${pipeline.id}`);
    console.log(`   Nome: ${pipeline.name}`);
    
    // Buscar estágios
    const stages = await service.getStages(pipeline.id);
    console.log(`\n📋 Estágios (${stages.data?.length || 0}):`);
    stages.data?.forEach((s: any) => {
      console.log(`   - ${s.name} (ID: ${s.id})`);
    });
    
    // Buscar deals
    const deals = await service.getDeals({ pipeline_id: pipeline.id });
    console.log(`\n📊 Deals: ${deals.data?.length || 0}`);
    const openDeals = deals.data?.filter((d: any) => d.status === 'open') || [];
    console.log(`   Abertos: ${openDeals.length}`);
  } else {
    console.log('❌ Não encontrada');
  }
}

test().catch(console.error);
