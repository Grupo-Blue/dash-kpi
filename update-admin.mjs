import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import mysql from 'mysql2/promise';
import { users } from './dist/drizzle/schema.js';

const DATABASE_URL = process.env.DATABASE_URL;
const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

await db.update(users).set({ openId: 'local_admin_grupoblue' }).where(eq(users.email, 'admin@grupoblue.com.br'));
console.log('✅ Updated admin openId');
await connection.end();
