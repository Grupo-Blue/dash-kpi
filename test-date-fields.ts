const PIPEDRIVE_API_TOKEN = '87820d5cbb1503e4ebe161c986d16ebe3a1ac572';
const baseUrl = 'https://api.pipedrive.com/v1';

async function testDateFields() {
  try {
    const url = `${baseUrl}/deals?api_token=${PIPEDRIVE_API_TOKEN}&status=won&limit=100`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success && data.data) {
      const pipeline5Deals = data.data.filter((d: any) => d.pipeline_id === 5);
      
      console.log('Analisando campos de data dos deals ganhos:\n');
      
      // Pegar primeiro deal como exemplo
      const example = pipeline5Deals[0];
      console.log('Exemplo de deal:');
      console.log(`  Title: ${example.title}`);
      console.log(`  Value: R$ ${((example.value || 0) * 100).toFixed(2)}`);
      console.log('\nCampos de data disponíveis:');
      console.log(`  won_time: ${example.won_time}`);
      console.log(`  update_time: ${example.update_time}`);
      console.log(`  add_time: ${example.add_time}`);
      console.log(`  stage_change_time: ${example.stage_change_time}`);
      console.log(`  close_time: ${example.close_time}`);
      console.log(`  first_won_time: ${example.first_won_time}`);
      console.log(`  last_activity_date: ${example.last_activity_date}`);
      
      // Filtrar por update_time em outubro/2025
      console.log('\n--- Testando filtro por UPDATE_TIME (outubro/2025) ---');
      const firstDayOct = new Date(2025, 9, 1);
      const lastDayOct = new Date(2025, 9, 31, 23, 59, 59);
      
      const octByUpdate = pipeline5Deals.filter((deal: any) => {
        if (!deal.update_time) return false;
        const updateDate = new Date(deal.update_time);
        return updateDate >= firstDayOct && updateDate <= lastDayOct;
      });
      
      console.log(`Deals com update_time em outubro/2025: ${octByUpdate.length}`);
      if (octByUpdate.length > 0) {
        const total = octByUpdate.reduce((sum: number, d: any) => sum + (d.value || 0), 0) * 100;
        console.log(`Faturamento: R$ ${total.toFixed(2)}`);
        console.log('\nPrimeiros 5 deals:');
        octByUpdate.slice(0, 5).forEach((d: any) => {
          console.log(`  - ${d.title}: R$ ${((d.value || 0) * 100).toFixed(2)}`);
          console.log(`    update_time: ${d.update_time}`);
          console.log(`    won_time: ${d.won_time}`);
        });
      }
      
      // Filtrar por close_time
      console.log('\n--- Testando filtro por CLOSE_TIME (outubro/2025) ---');
      const octByClose = pipeline5Deals.filter((deal: any) => {
        if (!deal.close_time) return false;
        const closeDate = new Date(deal.close_time);
        return closeDate >= firstDayOct && closeDate <= lastDayOct;
      });
      
      console.log(`Deals com close_time em outubro/2025: ${octByClose.length}`);
      if (octByClose.length > 0) {
        const total = octByClose.reduce((sum: number, d: any) => sum + (d.value || 0), 0) * 100;
        console.log(`Faturamento: R$ ${total.toFixed(2)}`);
      }
      
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}

testDateFields();
