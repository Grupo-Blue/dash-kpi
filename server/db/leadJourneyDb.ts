import { desc, eq } from "drizzle-orm";
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

    return cache;
  } catch (error) {
    console.error("[Database] Failed to get lead journey cache:", error);
    return null;
  }
}

/**
 * Salvar ou atualizar cache de dados de um lead
 */
export async function saveLeadJourneyCache(data: InsertLeadJourneyCache): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save lead journey cache: database not available");
    return;
  }

  try {
    // Tentar inserir, se já existir, atualizar
    await db
      .insert(leadJourneyCache)
      .values(data)
      .onDuplicateKeyUpdate({
        set: {
          mauticData: data.mauticData,
          pipedriveData: data.pipedriveData,
          aiAnalysis: data.aiAnalysis,
          cachedAt: data.cachedAt,
          expiresAt: data.expiresAt,
        },
      });
  } catch (error) {
    console.error("[Database] Failed to save lead journey cache:", error);
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
    const result = await db
      .delete(leadJourneyCache)
      .where(eq(leadJourneyCache.expiresAt, now));

    return 0; // MySQL não retorna quantidade de linhas deletadas facilmente
  } catch (error) {
    console.error("[Database] Failed to clean expired cache:", error);
    return 0;
  }
}
