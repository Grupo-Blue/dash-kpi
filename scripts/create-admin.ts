/**
 * Script para criar usuário administrador
 * 
 * Uso: npx tsx scripts/create-admin.ts
 */

import { createLocalUser } from '../server/services/localAuth';
import { getDb } from '../server/db';

async function main() {
  console.log('🔐 Criando usuário administrador...\n');

  const email = process.env.ADMIN_EMAIL || 'admin@grupoblue.com.br';
  const password = process.env.ADMIN_PASSWORD || 'admin123456';
  const name = process.env.ADMIN_NAME || 'Administrador';

  try {
    // Verificar conexão com banco
    const db = await getDb();
    if (!db) {
      throw new Error('Não foi possível conectar ao banco de dados');
    }

    // Criar usuário admin
    const user = await createLocalUser({
      email,
      password,
      name,
      role: 'admin',
    });

    console.log('✅ Usuário administrador criado com sucesso!\n');
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password);
    console.log('👤 Nome:', name);
    console.log('🎭 Role:', user.role);
    console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!\n');
    
    process.exit(0);
  } catch (error: any) {
    if (error.message === 'Email already registered') {
      console.error('❌ Erro: Email já cadastrado no sistema');
      console.log('\n💡 Use outro email ou faça login com as credenciais existentes\n');
    } else {
      console.error('❌ Erro ao criar usuário:', error.message);
    }
    process.exit(1);
  }
}

main();
