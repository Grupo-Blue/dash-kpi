const DISCORD_BOT_TOKEN = 'MTQzMjc1NzUwMjIzMTA1MjM5OA.GZ-OdW.HnVMf0GdzbmMZYqwxyBG8Rp4sjxHoJU76tnEiA';
const DISCORD_GUILD_ID = '954484479819407440';

async function testDiscord() {
  console.log('🔍 Testando API do Discord com novo token...\n');
  
  const headers = {
    'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
    'Content-Type': 'application/json',
  };
  
  try {
    // Test 1: Get Guild Info
    console.log('1️⃣ Informações do Servidor (Guild):');
    const guildResponse = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}?with_counts=true`, { headers });
    
    if (!guildResponse.ok) {
      console.log(`   ❌ Erro: ${guildResponse.status} ${guildResponse.statusText}`);
      const error = await guildResponse.text();
      console.log(`   Detalhes: ${error}`);
      return;
    }
    
    const guild = await guildResponse.json();
    console.log(`   ✅ Conectado!`);
    console.log(`   Nome: ${guild.name}`);
    console.log(`   Total de Membros: ${guild.approximate_member_count || guild.member_count || 'N/A'}`);
    console.log(`   Membros Online: ${guild.approximate_presence_count || 'N/A'}`);
    console.log(`   ID: ${guild.id}`);
    console.log('');
    
    // Test 2: Get Channels
    console.log('2️⃣ Canais do Servidor:');
    const channelsResponse = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/channels`, { headers });
    const channels = await channelsResponse.json();
    
    if (Array.isArray(channels)) {
      const textChannels = channels.filter((c: any) => c.type === 0);
      const voiceChannels = channels.filter((c: any) => c.type === 2);
      
      console.log(`   Total de Canais: ${channels.length}`);
      console.log(`   Canais de Texto: ${textChannels.length}`);
      console.log(`   Canais de Voz: ${voiceChannels.length}`);
      
      console.log(`\n   📝 Canais de Texto (primeiros 10):`);
      textChannels.slice(0, 10).forEach((c: any) => {
        console.log(`      - #${c.name}`);
      });
    }
    console.log('');
    
    // Test 3: Get Members
    console.log('3️⃣ Membros do Servidor:');
    const membersResponse = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members?limit=1000`, { headers });
    
    if (membersResponse.ok) {
      const members = await membersResponse.json();
      console.log(`   Total retornado: ${members.length}`);
      
      const bots = members.filter((m: any) => m.user?.bot);
      const humans = members.filter((m: any) => !m.user?.bot);
      
      console.log(`   Humanos: ${humans.length}`);
      console.log(`   Bots: ${bots.length}`);
      
      // Check join dates
      const now = Date.now();
      const last7Days = members.filter((m: any) => {
        const joinedAt = new Date(m.joined_at).getTime();
        return (now - joinedAt) < 7 * 24 * 60 * 60 * 1000;
      });
      const last30Days = members.filter((m: any) => {
        const joinedAt = new Date(m.joined_at).getTime();
        return (now - joinedAt) < 30 * 24 * 60 * 60 * 1000;
      });
      
      console.log(`   Novos (últimos 7 dias): ${last7Days.length}`);
      console.log(`   Novos (últimos 30 dias): ${last30Days.length}`);
    } else {
      console.log(`   ⚠️  Erro ao buscar membros: ${membersResponse.status}`);
    }
    console.log('');
    
    // Test 4: Get Roles
    console.log('4️⃣ Roles (Cargos):');
    const rolesResponse = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/roles`, { headers });
    const roles = await rolesResponse.json();
    
    if (Array.isArray(roles)) {
      console.log(`   Total de Roles: ${roles.length}`);
      console.log(`   Top 5 roles:`);
      roles.slice(0, 5).forEach((r: any) => {
        console.log(`      - ${r.name} (cor: ${r.color})`);
      });
    }
    console.log('');
    
    // Summary
    console.log('📊 Dados Disponíveis para KPIs:');
    console.log('   ✅ Total de membros');
    console.log('   ✅ Membros online');
    console.log('   ✅ Novos membros (7 e 30 dias)');
    console.log('   ✅ Lista de canais');
    console.log('   ✅ Distribuição humanos/bots');
    console.log('   ✅ Roles/cargos');
    console.log('');
    
    console.log('💡 KPIs Recomendados:');
    console.log('   1. Total de Membros');
    console.log('   2. Membros Online Agora');
    console.log('   3. Novos Membros (7 dias)');
    console.log('   4. Novos Membros (30 dias)');
    console.log('   5. Taxa de Crescimento');
    console.log('   6. Total de Canais');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testDiscord();
