import { MetricoolService } from './server/services/integrations';

const METRICOOL_API_KEY = 'b0e2fc99c9d7c5e7e4fa4d1c50d8f2a8';

async function testTikTokData() {
  const service = new MetricoolService(METRICOOL_API_KEY);
  
  // Mychel Mendes
  const mychelBlogId = 3893476;
  const from = '2024-10-01';
  const to = '2024-10-31';
  
  console.log('\n=== TESTANDO DADOS DO TIKTOK - MYCHEL MENDES ===\n');
  console.log(`BlogId: ${mychelBlogId}`);
  console.log(`Período: ${from} a ${to}\n`);
  
  try {
    const tiktokVideos = await service.getTikTokVideos(mychelBlogId, from, to);
    console.log('TikTok Videos Response:', JSON.stringify(tiktokVideos, null, 2));
    
    if (tiktokVideos.data && tiktokVideos.data.length > 0) {
      console.log(`\n✅ Total de vídeos: ${tiktokVideos.data.length}`);
      console.log('\nPrimeiro vídeo:');
      console.log(JSON.stringify(tiktokVideos.data[0], null, 2));
    } else {
      console.log('\n⚠️ Nenhum vídeo encontrado no período');
    }
  } catch (error) {
    console.error('❌ Erro ao buscar vídeos do TikTok:', error);
  }
}

testTikTokData();
