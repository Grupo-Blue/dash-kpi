const DISCORD_BOT_TOKEN = '4cea4724d19e055cdce4ec6a09d00ec228ca13333dc7aa6f0c66b7510b06546b';
const DISCORD_GUILD_ID = '954484479819407440';

async function testDiscord() {
  console.log('🔍 Testando API do Discord...\n');
  
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
    console.log(`   Nome: ${guild.name}`);
    console.log(`   Total de Membros: ${guild.approximate_member_count || 'N/A'}`);
    console.log(`   Membros Online: ${guild.approximate_presence_count || 'N/A'}`);
    console.log(`   Criado em: ${new Date(parseInt(guild.id) / 4194304 + 1420070400000).toLocaleDateString('pt-BR')}`);
    console.log('');
    
    // Test 2: Get Channels
    console.log('2️⃣ Canais do Servidor:');
    const channelsResponse = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/channels`, { headers });
    const channels = await channelsResponse.json();
    
    const textChannels = channels.filter((c: any) => c.type === 0); // Text channels
    const voiceChannels = channels.filter((c: any) => c.type === 2); // Voice channels
    const categories = channels.filter((c: any) => c.type === 4); // Categories
    
    console.log(`   Total de Canais: ${channels.length}`);
    console.log(`   Canais de Texto: ${textChannels.length}`);
    console.log(`   Canais de Voz: ${voiceChannels.length}`);
    console.log(`   Categorias: ${categories.length}`);
    console.log('');
    
    // Test 3: Get Members (limited to 100)
    console.log('3️⃣ Membros do Servidor (amostra):');
    const membersResponse = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members?limit=100`, { headers });
    const members = await membersResponse.json();
    console.log(`   Membros retornados: ${members.length}`);
    
    const bots = members.filter((m: any) => m.user?.bot);
    const humans = members.filter((m: any) => !m.user?.bot);
    console.log(`   Humanos: ${humans.length}`);
    console.log(`   Bots: ${bots.length}`);
    console.log('');
    
    // Test 4: Get Roles
    console.log('4️⃣ Roles (Cargos):');
    const rolesResponse = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/roles`, { headers });
    const roles = await rolesResponse.json();
    console.log(`   Total de Roles: ${roles.length}`);
    roles.slice(0, 5).forEach((r: any) => {
      console.log(`   - ${r.name} (${r.member_count || '?'} membros)`);
    });
    console.log('');
    
    // Test 5: Sample messages from first text channel
    if (textChannels.length > 0) {
      console.log('5️⃣ Mensagens Recentes (primeiro canal de texto):');
      const firstChannel = textChannels[0];
      console.log(`   Canal: #${firstChannel.name}`);
      
      const messagesResponse = await fetch(`https://discord.com/api/v10/channels/${firstChannel.id}/messages?limit=10`, { headers });
      
      if (messagesResponse.ok) {
        const messages = await messagesResponse.json();
        console.log(`   Mensagens retornadas: ${messages.length}`);
        
        if (messages.length > 0) {
          const lastMessage = messages[0];
          console.log(`   Última mensagem: ${new Date(lastMessage.timestamp).toLocaleString('pt-BR')}`);
          console.log(`   Autor: ${lastMessage.author?.username || 'Desconhecido'}`);
        }
      } else {
        console.log(`   ⚠️  Não foi possível buscar mensagens (pode precisar de permissões adicionais)`);
      }
      console.log('');
    }
    
    // Summary
    console.log('📊 Resumo de Dados Disponíveis:');
    console.log('   ✅ Total de membros (approximate_member_count)');
    console.log('   ✅ Membros online (approximate_presence_count)');
    console.log('   ✅ Lista de canais (nome, tipo, categoria)');
    console.log('   ✅ Lista de membros (limitado, paginado)');
    console.log('   ✅ Lista de roles/cargos');
    console.log('   ✅ Mensagens recentes por canal (se tiver permissão)');
    console.log('');
    
    console.log('💡 KPIs Possíveis:');
    console.log('   - Total de membros');
    console.log('   - Membros online agora');
    console.log('   - Novos membros (comparando ao longo do tempo)');
    console.log('   - Canais mais ativos (contando mensagens)');
    console.log('   - Taxa de engajamento (mensagens/membro)');
    console.log('   - Distribuição por roles');
    
  } catch (error) {
    console.error('❌ Erro ao testar Discord API:', error);
  }
}

testDiscord();
