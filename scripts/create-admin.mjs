#!/usr/bin/env node

/**
 * Script para criar usuário admin inicial
 * Uso: node scripts/create-admin.mjs
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL || 'mysql://kpi_user:KpiDash2024Secure@localhost:3306/kpi_dashboard';

async function createAdmin() {
  console.log('🔐 Criando usuário administrador...\n');

  // Conectar ao banco
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  // Dados do admin
  const adminEmail = 'admin@grupoblue.com.br';
  const adminPassword = 'GrupoBlue2024!';
  const adminName = 'Administrador';

  // Verificar se já existe
  const [existing] = await connection.execute(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [adminEmail]
  );

  if (existing.length > 0) {
    console.log('⚠️  Usuário admin já existe!');
    console.log(`   Email: ${adminEmail}`);
    console.log('\n💡 Para resetar a senha, delete o usuário no banco e execute este script novamente.\n');
    await connection.end();
    return;
  }

  // Hash da senha
  console.log('🔒 Gerando hash da senha...');
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  // Criar usuário
  console.log('👤 Criando usuário no banco de dados...');
  await connection.execute(
    `INSERT INTO users (email, password, name, role, loginMethod, createdAt, updatedAt, lastSignedIn) 
     VALUES (?, ?, ?, 'admin', 'local', NOW(), NOW(), NOW())`,
    [adminEmail, passwordHash, adminName]
  );

  console.log('\n✅ Usuário administrador criado com sucesso!\n');
  console.log('📋 Credenciais de acesso:');
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Email:    ${adminEmail}`);
  console.log(`   Senha:    ${adminPassword}`);
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('⚠️  IMPORTANTE: Guarde essas credenciais em local seguro!\n');

  await connection.end();
}

createAdmin().catch((error) => {
  console.error('❌ Erro ao criar usuário admin:', error);
  process.exit(1);
});
