const PIPEDRIVE_API_TOKEN = '87820d5cbb1503e4ebe161c986d16ebe3a1ac572';
const baseUrl = 'https://api.pipedrive.com/v1';

async function testWonTime() {
  try {
    // Buscar todos os deals ganhos
    const url = `${baseUrl}/deals?api_token=${PIPEDRIVE_API_TOKEN}&status=won&limit=100`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success && data.data) {
      // Filtrar por pipeline 5
      const pipeline5Deals = data.data.filter((d: any) => d.pipeline_id === 5);
      
      console.log(`Total de deals ganhos na Pipeline 5: ${pipeline5Deals.length}\n`);
      
      // Mostrar alguns exemplos com won_time
      console.log('Exemplos de deals ganhos (com won_time):');
      pipeline5Deals.slice(0, 5).forEach((deal: any) => {
        console.log(`  - ${deal.title}`);
        console.log(`    Value: R$ ${((deal.value || 0) * 100).toFixed(2)}`);
        console.log(`    Won Time: ${deal.won_time}`);
        console.log(`    Update Time: ${deal.update_time}`);
        console.log('');
      });
      
      // Filtrar por outubro/2025
      const now = new Date();
      const firstDayOct = new Date(2025, 9, 1); // Outubro = mês 9
      const lastDayOct = new Date(2025, 9, 31, 23, 59, 59);
      
      const octDeals = pipeline5Deals.filter((deal: any) => {
        if (!deal.won_time) return false;
        const wonDate = new Date(deal.won_time);
        return wonDate >= firstDayOct && wonDate <= lastDayOct;
      });
      
      console.log(`\nDeals ganhos em OUTUBRO/2025: ${octDeals.length}`);
      if (octDeals.length > 0) {
        octDeals.forEach((deal: any) => {
          console.log(`  - ${deal.title}: R$ ${((deal.value || 0) * 100).toFixed(2)} (${deal.won_time})`);
        });
        
        const totalOct = octDeals.reduce((sum: number, d: any) => sum + (d.value || 0), 0) * 100;
        console.log(`\nFaturamento Outubro/2025: R$ ${totalOct.toFixed(2)}`);
      }
      
      // Verificar qual mês teve vendas recentemente
      console.log('\n--- Vendas por mês (últimos 3 meses) ---');
      for (let i = 0; i < 3; i++) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
        
        const monthDeals = pipeline5Deals.filter((deal: any) => {
          if (!deal.won_time) return false;
          const wonDate = new Date(deal.won_time);
          return wonDate >= firstDay && wonDate <= lastDay;
        });
        
        const total = monthDeals.reduce((sum: number, d: any) => sum + (d.value || 0), 0) * 100;
        console.log(`${monthDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}: ${monthDeals.length} deals - R$ ${total.toFixed(2)}`);
      }
      
    } else {
      console.error('Erro:', data);
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}

testWonTime();
