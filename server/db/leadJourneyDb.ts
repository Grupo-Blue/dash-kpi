import { eq, sql } from "drizzle-orm";
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
    throw new Error(`[Database] Invalid date value provided: ${value}`);
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

    // Fazer parse dos campos JSON que agora são TEXT
    return {
      ...cache,
      mauticData: cache.mauticData ? JSON.parse(cache.mauticData) : null,
      pipedriveData: cache.pipedriveData ? JSON.parse(cache.pipedriveData) : null,
    };
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
    // Normalizar e forçar serialização JSON para remover TODOS os objetos Date
    const mauticNormalized = normalizeJsonDates(data.mauticData ?? {});
    const pipedriveNormalized = normalizeJsonDates(data.pipedriveData ?? {});
    
    // Converter para strings JSON manualmente
    const mauticDataStr = JSON.stringify(mauticNormalized);
    const pipedriveDataStr = JSON.stringify(pipedriveNormalized);
    const aiAnalysisStr = data.aiAnalysis ?? "";
    const cachedAtDate = normalizeDateValue(data.cachedAt ?? new Date());
    const expiresAtDate = normalizeDateValue(data.expiresAt ?? new Date());

    // Formatar datas para MySQL (YYYY-MM-DD HH:MM:SS)
    const formatMysqlDateTime = (date: Date): string => {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
             `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const cachedAtStr = formatMysqlDateTime(cachedAtDate);
    const expiresAtStr = formatMysqlDateTime(expiresAtDate);

    console.log("[DEBUG] Usando SQL RAW para bypass do Drizzle ORM");
    console.log("[DEBUG] - email:", data.email);
    console.log("[DEBUG] - mauticData length:", mauticDataStr.length);
    console.log("[DEBUG] - pipedriveData length:", pipedriveDataStr.length);
    console.log("[DEBUG] - cachedAt:", cachedAtStr);
    console.log("[DEBUG] - expiresAt:", expiresAtStr);

    // Usar SQL RAW para bypass completo do Drizzle ORM
    // Acessar o client mysql2 diretamente
    const client = (db as any).$client;
    
    const query = `
      INSERT INTO leadJourneyCache 
        (email, mauticData, pipedriveData, aiAnalysis, cachedAt, expiresAt)
      VALUES 
        (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        mauticData = VALUES(mauticData),
        pipedriveData = VALUES(pipedriveData),
        aiAnalysis = VALUES(aiAnalysis),
        cachedAt = VALUES(cachedAt),
        expiresAt = VALUES(expiresAt)
    `;

    // Executar SQL raw diretamente no client mysql2
    await client.execute(query, [
      data.email,
      mauticDataStr,
      pipedriveDataStr,
      aiAnalysisStr,
      cachedAtStr,
      expiresAtStr,
    ]);
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
