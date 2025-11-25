import { eq, lt, sql, desc } from "drizzle-orm";
import { getDb } from "../db";
import {
  leadJourneySearches,
  leadJourneyCache,
  InsertLeadJourneySearch,
  InsertLeadJourneyCache,
  LeadJourneySearch,
  LeadJourneyCache,
} from "../../drizzle/schema";

const ISO_DATE_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function formatMysqlDate(date: Date): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function normalizeDateString(value: string): string {
  if (!ISO_DATE_REGEX.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return formatMysqlDate(parsed);
}

function normalizeJsonDates<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(item => normalizeJsonDates(item)) as unknown as T;
  }

  if (value instanceof Date) {
    return formatMysqlDate(value) as unknown as T;
  }

  if (typeof value === "object") {
    const normalizedEntries = Object.entries(value as Record<string, unknown>).reduce(
      (acc, [key, entryValue]) => {
        acc[key] = normalizeJsonDates(entryValue);
        return acc;
      },
      {} as Record<string, unknown>
    );

    return normalizedEntries as unknown as T;
  }

  if (typeof value === "string") {
    return normalizeDateString(value) as unknown as T;
  }

  return value;
}

function normalizeDateValue(value: string | number | Date): Date {
  if (value instanceof Date) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    // Em vez de quebrar tudo, loga e usa agora:
    console.warn('[Database] Invalid date value provided, using now():', value);
    return new Date();
  }

  return parsed;
}

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

    // Retornar cache (campos JSON já vem como objetos)
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
    console.log('[saveLeadJourneyCache] ✅ Starting save operation for email:', data.email);
    console.log('[saveLeadJourneyCache] 🔍 DB instance exists:', !!db);
    console.log('[saveLeadJourneyCache] 🔍 DB type:', typeof db);
    
    // Normalizar datas dentro dos objetos JSON
    const mauticNormalized = normalizeJsonDates(data.mauticData ?? {});
    const pipedriveNormalized = normalizeJsonDates(data.pipedriveData ?? {});
    
    const normalizedData: InsertLeadJourneyCache = {
      email: data.email,
      mauticData: mauticNormalized as any,
      pipedriveData: pipedriveNormalized as any,
      aiAnalysis: data.aiAnalysis ?? "",
      cachedAt: normalizeDateValue(data.cachedAt ?? new Date()),
      expiresAt: normalizeDateValue(data.expiresAt ?? new Date()),
    };
    
    console.log('[saveLeadJourneyCache] 📦 Normalized data prepared');
    console.log('[saveLeadJourneyCache] - mauticData type:', typeof normalizedData.mauticData);
    console.log('[saveLeadJourneyCache] - pipedriveData type:', typeof normalizedData.pipedriveData);
    console.log('[saveLeadJourneyCache] - cachedAt:', normalizedData.cachedAt);
    console.log('[saveLeadJourneyCache] - expiresAt:', normalizedData.expiresAt);
    
    console.log('[saveLeadJourneyCache] 🚀 Attempting INSERT...');
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
    
    console.log('[saveLeadJourneyCache] ✅ INSERT successful!');
    
    // 🔍 VERIFICAÇÃO: Confirmar se dados foram realmente salvos
    const saved = await db.select().from(leadJourneyCache)
      .where(eq(leadJourneyCache.email, data.email)).limit(1);
    
    if (saved.length > 0) {
      console.log('[saveLeadJourneyCache] ✅ VERIFICATION: Data FOUND in database');
      console.log('[saveLeadJourneyCache] 📊 Saved record ID:', saved[0].id);
      console.log('[saveLeadJourneyCache] 📊 Saved cachedAt:', saved[0].cachedAt);
      
      // Verificar se acquisition foi salvo
      const acquisition = (saved[0].mauticData as any)?.acquisition;
      if (acquisition) {
        console.log('[saveLeadJourneyCache] ✅ acquisition data exists in saved record');
        console.log('[saveLeadJourneyCache] 📊 firstTouch.utmSource:', acquisition.firstTouch?.utmSource);
        console.log('[saveLeadJourneyCache] 📊 firstTouch.utmMedium:', acquisition.firstTouch?.utmMedium);
        console.log('[saveLeadJourneyCache] 📊 firstTouch.utmCampaign:', acquisition.firstTouch?.utmCampaign);
      } else {
        console.log('[saveLeadJourneyCache] ❌ acquisition data is NULL or missing in saved record');
      }
    } else {
      console.log('[saveLeadJourneyCache] ❌ VERIFICATION FAILED: Data NOT FOUND in database!');
      console.log('[saveLeadJourneyCache] ❌ This indicates a rollback or silent failure');
    }
  } catch (error: any) {
    console.error('[saveLeadJourneyCache] ❌ ERROR occurred!');
    console.error('[saveLeadJourneyCache] Error type:', error?.constructor?.name);
    console.error('[saveLeadJourneyCache] Error message:', error?.message);
    console.error('[saveLeadJourneyCache] Error code:', error?.code);
    console.error('[saveLeadJourneyCache] Error errno:', error?.errno);
    console.error('[saveLeadJourneyCache] Error sqlState:', error?.sqlState);
    console.error('[saveLeadJourneyCache] Error sqlMessage:', error?.sqlMessage);
    console.error('[saveLeadJourneyCache] Full error:', JSON.stringify(error, null, 2));
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
      .where(lt(leadJourneyCache.expiresAt, now)); // Corrigido: usar lt (menor que) ao invés de eq (igualdade)

    return 0; // MySQL não retorna quantidade de linhas deletadas facilmente
  } catch (error) {
    console.error("[Database] Failed to clean expired cache:", error);
    return 0;
  }
}
