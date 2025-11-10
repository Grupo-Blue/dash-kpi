import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import { users } from '../../drizzle/schema';

/**
 * Serviço de autenticação local com usuário e senha
 */

export interface LocalAuthCredentials {
  email: string;
  password: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'admin';
}

/**
 * Cria hash da senha usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verifica se a senha corresponde ao hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Autentica usuário com email e senha
 * Retorna o usuário se credenciais válidas, null caso contrário
 */
export async function authenticateUser(credentials: LocalAuthCredentials) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  // Buscar usuário por email
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, credentials.email))
    .limit(1);

  if (result.length === 0) {
    return null; // Usuário não encontrado
  }

  const user = result[0];

  // Verificar se tem senha configurada
  if (!user.password) {
    return null; // Usuário sem senha (OAuth only)
  }

  // Verificar senha
  const isValid = await verifyPassword(credentials.password, user.password);
  if (!isValid) {
    return null; // Senha incorreta
  }

  // Atualizar último login
  await db
    .update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, user.id));

  // Retornar usuário sem a senha
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Cria novo usuário com email e senha
 */
export async function createLocalUser(data: CreateUserData) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  // Verificar se email já existe
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (existing.length > 0) {
    throw new Error('Email already registered');
  }

  // Hash da senha
  const passwordHash = await hashPassword(data.password);

  // Criar usuário
  await db.insert(users).values({
    email: data.email,
    password: passwordHash,
    name: data.name,
    role: data.role || 'user',
    loginMethod: 'local',
    openId: null, // Não usa OAuth
  });

  // Buscar usuário criado
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (result.length === 0) {
    throw new Error('Failed to create user');
  }

  const { password, ...userWithoutPassword } = result[0];
  return userWithoutPassword;
}

/**
 * Atualiza senha do usuário
 */
export async function updateUserPassword(userId: number, newPassword: string) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const passwordHash = await hashPassword(newPassword);

  await db
    .update(users)
    .set({ password: passwordHash })
    .where(eq(users.id, userId));

  return true;
}
