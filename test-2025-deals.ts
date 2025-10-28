const PIPEDRIVE_API_TOKEN = '87820d5cbb1503e4ebe161c986d16ebe3a1ac572';
const baseUrl = 'https://api.pipedrive.com/v1';

async function test2025Deals() {
  try {
    // Buscar TODOS os deals ganhos (sem limite de paginação)
    let allDeals: any[] = [];
    let start = 0;
    const limit = 500;
    
    while (true) {
      const url = `${baseUrl}/deals?api_token=${PIPEDRIVE_API_TOKEN}&status=won&start=${start}&limit=${limit}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.data) {
        allDeals = allDeals.concat(data.data);
        if (!data.additional_data?.pagination?.more_items_in_collection) {
          break;
        }
        start += limit;
      } else {
        break;
      }
    }
    
    console.log(`Total de deals ganhos (todos): ${allDeals.length}\n`);
    
    // Filtrar por pipeline 5
    const pipeline5 = allDeals.filter(d => d.pipeline_id === 5);
    console.log(`Pipeline 5 (Blue - Pipeline de Vendas): ${pipeline5.length} deals\n`);
    
    // Filtrar por won_time em 2025
    const deals2025 = pipeline5.filter((deal: any) => {
      if (!deal.won_time) return false;
      const wonDate = new Date(deal.won_time);
      return wonDate.getFullYear() === 2025;
    });
    
    console.log(`Deals ganhos em 2025 (won_time): ${deals2025.length}`);
    if (deals2025.length > 0) {
      const total = deals2025.reduce((sum: number, d: any) => sum + (d.value || 0), 0) * 100;
      console.log(`Faturamento 2025: R$ ${total.toFixed(2)}\n`);
      
      console.log('Deals de 2025:');
      deals2025.forEach((d: any) => {
        console.log(`  - ${d.title}`);
        console.log(`    Value: R$ ${((d.value || 0) * 100).toFixed(2)}`);
        console.log(`    Won time: ${d.won_time}`);
      });
    }
    
    // Tentar filtro por close_time
    const deals2025Close = pipeline5.filter((deal: any) => {
      if (!deal.close_time) return false;
      const closeDate = new Date(deal.close_time);
      return closeDate.getFullYear() === 2025;
    });
    
    console.log(`\nDeals ganhos em 2025 (close_time): ${deals2025Close.length}`);
    if (deals2025Close.length > 0) {
      const total = deals2025Close.reduce((sum: number, d: any) => sum + (d.value || 0), 0) * 100;
      console.log(`Faturamento 2025: R$ ${total.toFixed(2)}`);
    }
    
    // Tentar filtro por update_time
    const deals2025Update = pipeline5.filter((deal: any) => {
      if (!deal.update_time) return false;
      const updateDate = new Date(deal.update_time);
      return updateDate.getFullYear() === 2025;
    });
    
    console.log(`\nDeals com update em 2025 (update_time): ${deals2025Update.length}`);
    if (deals2025Update.length > 0) {
      const total = deals2025Update.reduce((sum: number, d: any) => sum + (d.value || 0), 0) * 100;
      console.log(`Faturamento (update 2025): R$ ${total.toFixed(2)}`);
      
      // Ver outubro especificamente
      const oct2025 = deals2025Update.filter((deal: any) => {
        const updateDate = new Date(deal.update_time);
        return updateDate.getMonth() === 9; // Outubro = mês 9
      });
      
      if (oct2025.length > 0) {
        const totalOct = oct2025.reduce((sum: number, d: any) => sum + (d.value || 0), 0) * 100;
        console.log(`\n🎯 OUTUBRO 2025 (update_time): ${oct2025.length} deals - R$ ${totalOct.toFixed(2)}`);
        
        if (oct2025.length === 38 || Math.abs(totalOct - 89414.61) < 100) {
          console.log('\n✅ ENCONTRADO! Este é o filtro correto!');
        }
      }
    }
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

test2025Deals();
