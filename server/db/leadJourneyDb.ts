import { desc, eq, lt } from "drizzle-orm";
import { getDb } from "../db";
import {
  leadJourneySearches,
  leadJourneyCache,
  InsertLeadJourneySearch,
  InsertLeadJourneyCache,
  LeadJourneySearch,
  LeadJourneyCache,
} from "../../drizzle/schema";

/**
 * Salvar uma busca de lead no histórico
 */
export async function saveLeadJourneySearch(data: InsertLeadJourneySearch): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save lead journey search: database not available");
    return;
  }

  try {
    await db.insert(leadJourneySearches).values(data);
  } catch (error) {
    console.error("[Database] Failed to save lead journey search:", error);
    throw error;
  }
}

/**
 * Obter histórico de pesquisas de leads (últimas 50)
 */
export async function getLeadJourneyHistory(userId: number, limit: number = 50): Promise<LeadJourneySearch[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get lead journey history: database not available");
    return [];
  }

  try {
    const results = await db
      .select()
      .from(leadJourneySearches)
      .where(eq(leadJourneySearches.searchedBy, userId))
      .orderBy(desc(leadJourneySearches.searchedAt))
      .limit(limit);

    return results;
  } catch (error) {
    console.error("[Database] Failed to get lead journey history:", error);
    return [];
  }
}

/**
 * Obter cache de dados de um lead por e-mail
 */
export async function getLeadJourneyCache(email: string): Promise<LeadJourneyCache | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get lead journey cache: database not available");
    return null;
  }

  try {
    const results = await db
      .select()
      .from(leadJourneyCache)
      .where(eq(leadJourneyCache.email, email))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    const cache = results[0];

    // Verificar se o cache expirou
    const now = new Date();
    if (cache.expiresAt < now) {
      // Cache expirado, deletar
      await db.delete(leadJourneyCache).where(eq(leadJourneyCache.email, email));
      return null;
    }

    // Deserializar JSON
    if (typeof cache.mauticData === "string") cache.mauticData = JSON.parse(cache.mauticData);
    if (typeof cache.pipedriveData === "string") cache.pipedriveData = JSON.parse(cache.pipedriveData);
    return cache;
  } catch (error) {
    console.error("[Database] Failed to get lead journey cache:", error);
    return null;
  }
}

/**
 * Salvar ou atualizar cache de dados de um lead
 */
/**
 * Normalizar datas em objetos JSON para evitar problemas com timezone
 * Converte strings ISO com +00:00 para formato MySQL
 */
function normalizeDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    // Se é uma string de data ISO, normalizar
    if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/.test(obj)) {
      return obj.replace('T', ' ').replace(/\.\d{3}Z?$/, '').replace(/[+-]\d{2}:\d{2}$/, '');
    }
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(normalizeDates);
  }
  
  if (typeof obj === 'object') {
    const normalized: any = {};
    for (const key in obj) {
      normalized[key] = normalizeDates(obj[key]);
    }
    return normalized;
  }
  
  return obj;
}

export async function saveLeadJourneyCache(data: InsertLeadJourneyCache): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save lead journey cache: database not available");
    return;
  }

  try {
    console.log('[DEBUG] Saving cache with data:', {
      email: data.email,
      cachedAt: data.cachedAt,
      cachedAtType: typeof data.cachedAt,
      expiresAt: data.expiresAt,
      expiresAtType: typeof data.expiresAt
    });
    
    // Normalizar datas antes de salvar
    const normalizedMautic = normalizeDates(data.mauticData);
    const normalizedPipedrive = normalizeDates(data.pipedriveData);
    
    // [BUG INVESTIGATION] Log detalhado antes do JSON.stringify
    console.log('[DEBUG] normalizedMautic keys:', Object.keys(normalizedMautic));
    console.log('[DEBUG] normalizedMautic.acquisition:', normalizedMautic.acquisition);
    console.log('[DEBUG] normalizedMautic.acquisition type:', typeof normalizedMautic.acquisition);
    
    const mauticDataStringified = JSON.stringify(normalizedMautic);
    const pipedriveDataStringified = JSON.stringify(normalizedPipedrive);
    
    console.log('[DEBUG] mauticDataStringified includes "acquisition":', mauticDataStringified.includes('"acquisition"'));
    console.log('[DEBUG] mauticDataStringified length:', mauticDataStringified.length);
    
    const normalizedData = {
      email: data.email,
      mauticData: mauticDataStringified as any,
      pipedriveData: pipedriveDataStringified as any,
      aiAnalysis: data.aiAnalysis || '', // Garantir que nunca seja null
      cachedAt: data.cachedAt instanceof Date ? data.cachedAt : new Date(data.cachedAt),
      expiresAt: data.expiresAt instanceof Date ? data.expiresAt : new Date(data.expiresAt),
    };
    
    // Tentar inserir, se já existir, atualizar
    await db
      .insert(leadJourneyCache)
      .values(normalizedData)
      .onDuplicateKeyUpdate({
        set: {
          mauticData: normalizedData.mauticData,
          pipedriveData: normalizedData.pipedriveData,
          aiAnalysis: normalizedData.aiAnalysis,
          cachedAt: normalizedData.cachedAt,
          expiresAt: normalizedData.expiresAt,
        },
      });
  } catch (error: any) {
    console.error("[Database] Failed to save lead journey cache:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sql: error.sql,
      sqlMessage: error.sqlMessage,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Deletar cache expirado (limpeza periódica)
 */
export async function cleanExpiredCache(): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot clean expired cache: database not available");
    return 0;
  }

  try {
    const now = new Date();
    
    // First, count how many rows will be deleted
    const toDelete = await db
      .select()
      .from(leadJourneyCache)
      .where(lt(leadJourneyCache.expiresAt, now));
    
    const count = toDelete.length;
    
    if (count > 0) {
      // Delete expired cache entries (expiresAt < now)
      await db
        .delete(leadJourneyCache)
        .where(lt(leadJourneyCache.expiresAt, now));
    }

    return count;
  } catch (error) {
    console.error("[Database] Failed to clean expired cache:", error);
    return 0;
  }
}
