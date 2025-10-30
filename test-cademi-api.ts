import { fetchAllUsers } from './server/services/cademiService';

async function testCademiApi() {
  console.log('=== Testing Cademi API ===');
  console.log('API Key configured:', !!process.env.CADEMI_API_KEY);
  console.log('API Key length:', process.env.CADEMI_API_KEY?.length || 0);
  
  try {
    console.log('\nFetching users from Cademi API...');
    const users = await fetchAllUsers();
    
    console.log('\n✅ SUCCESS!');
    console.log(`Total users fetched: ${users.length}`);
    
    if (users.length > 0) {
      console.log('\nSample user:');
      const sample = users[0];
      console.log('- ID:', sample.id);
      console.log('- Nome:', sample.nome);
      console.log('- Email:', sample.email);
      console.log('- Criado em:', sample.criado_em);
      console.log('- Último acesso:', sample.ultimo_acesso_em || 'Nunca');
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

testCademiApi();
