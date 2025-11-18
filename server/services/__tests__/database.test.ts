import { describe, it, expect } from 'vitest';
import { getDb } from '../../db';
import { mauticEmails } from '../../../drizzle/schema';

describe('Database Connection', () => {
  it('should connect to database and query mauticEmails', async () => {
    const db = await getDb();
    expect(db).not.toBeNull();
    
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    // Tentar buscar alguns e-mails do cache
    const emails = await db.select().from(mauticEmails).limit(3);
    
    // Verificar que retornou dados
    expect(emails).toBeDefined();
    expect(Array.isArray(emails)).toBe(true);
    
    // Se houver dados, verificar estrutura
    if (emails.length > 0) {
      expect(emails[0]).toHaveProperty('id');
      expect(emails[0]).toHaveProperty('mauticId');
      expect(emails[0]).toHaveProperty('name');
    }
    
    console.log(`✅ Database connected! Found ${emails.length} emails in cache`);
  }, 10000); // 10 segundos de timeout
});
