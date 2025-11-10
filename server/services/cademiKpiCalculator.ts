/**
 * Cademi KPI Calculator
 * 
 * Processa dados da API Cademi e calcula KPIs para Tokeniza Academy
 */

import { fetchAllUsers, type CademiUser } from './cademiService';

export interface CademiKpis {
  totalStudents: number;
  studentsVariation: number; // Percentual de variação nas últimas 4 semanas
  newStudentsLast30Days: number; // Novos alunos nos últimos 30 dias
  accessLast30Days: number;
  accessDistribution: {
    today: number;
    yesterday: number;
    days2to7: number;
    days7to14: number;
    days14to30: number;
  };
  neverAccessed: number;
  topActiveStudents: Array<{
    id: number;
    name: string;
    email: string;
    lastAccess: string;
    daysAgo: number;
  }>;
  totalCourses: number;
}

/**
 * Calcula diferença em dias entre duas datas
 */
function daysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Agrupa usuários por mês de criação
 */
function groupByMonth(users: CademiUser[]): Map<string, number> {
  const byMonth = new Map<string, number>();
  
  for (const user of users) {
    const date = new Date(user.criado_em);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    byMonth.set(monthKey, (byMonth.get(monthKey) || 0) + 1);
  }
  
  return byMonth;
}

/**
 * Calcula distribuição de acessos nos últimos 30 dias
 */
function calculateAccessDistribution(users: CademiUser[], now: Date) {
  const distribution = {
    today: 0,
    yesterday: 0,
    days2to7: 0,
    days7to14: 0,
    days14to30: 0,
  };

  for (const user of users) {
    if (!user.ultimo_acesso_em) continue;

    const lastAccess = new Date(user.ultimo_acesso_em);
    const daysAgo = daysBetween(lastAccess, now);

    if (daysAgo === 0) {
      distribution.today++;
    } else if (daysAgo === 1) {
      distribution.yesterday++;
    } else if (daysAgo >= 2 && daysAgo <= 7) {
      distribution.days2to7++;
    } else if (daysAgo >= 8 && daysAgo <= 14) {
      distribution.days7to14++;
    } else if (daysAgo >= 15 && daysAgo <= 30) {
      distribution.days14to30++;
    }
  }

  return distribution;
}

/**
 * Calcula variação de alunos nas últimas 4 semanas
 */
function calculateStudentsVariation(users: CademiUser[], now: Date): number {
  const fourWeeksAgo = new Date(now);
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  
  const eightWeeksAgo = new Date(now);
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

  const last4Weeks = users.filter(u => {
    const created = new Date(u.criado_em);
    return created >= fourWeeksAgo && created <= now;
  }).length;

  const previous4Weeks = users.filter(u => {
    const created = new Date(u.criado_em);
    return created >= eightWeeksAgo && created < fourWeeksAgo;
  }).length;

  if (previous4Weeks === 0) return 0;
  
  return ((last4Weeks - previous4Weeks) / previous4Weeks) * 100;
}

/**
 * Calcula KPIs da Cademi
 */
export async function calculateCademiKpis(): Promise<CademiKpis> {
  console.log('[CademiKPI] Starting KPI calculation...');
  
  try {
    // Busca todos os usuários
    const users = await fetchAllUsers();
    const now = new Date();

    // Total de alunos
    const totalStudents = users.length;

    // Variação nas últimas 4 semanas
    const studentsVariation = calculateStudentsVariation(users, now);

    // Novos alunos nos últimos 30 dias
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newStudentsLast30Days = users.filter(u => {
      const created = new Date(u.criado_em);
      return created >= thirtyDaysAgo;
    }).length;

    // Acessos nos últimos 30 dias
    const accessLast30Days = users.filter(u => {
      if (!u.ultimo_acesso_em) return false;
      const lastAccess = new Date(u.ultimo_acesso_em);
      return lastAccess >= thirtyDaysAgo;
    }).length;

    // Distribuição de acessos
    const accessDistribution = calculateAccessDistribution(users, now);

    // Nunca acessou
    const neverAccessed = users.filter(u => !u.ultimo_acesso_em).length;

    // Top 5 alunos mais ativos nos últimos 30 dias
    const activeStudents = users
      .filter(u => {
        if (!u.ultimo_acesso_em) return false;
        const lastAccess = new Date(u.ultimo_acesso_em);
        return lastAccess >= thirtyDaysAgo;
      })
      .map(u => {
        const lastAccess = new Date(u.ultimo_acesso_em!);
        const daysAgo = daysBetween(lastAccess, now);
        return {
          id: u.id,
          name: u.nome,
          email: u.email || 'N/A',
          lastAccess: lastAccess.toISOString(),
          daysAgo
        };
      })
      .sort((a, b) => a.daysAgo - b.daysAgo)
      .slice(0, 5);

    // Total de cursos (será buscado da API /produto)
    const totalCourses = 0; // Será atualizado no router

    console.log('[CademiKPI] KPIs calculated successfully');
    console.log(`[CademiKPI] Total students: ${totalStudents}`);
    console.log(`[CademiKPI] Variation: ${studentsVariation.toFixed(2)}%`);
    console.log(`[CademiKPI] New students last 30 days: ${newStudentsLast30Days}`);
    console.log(`[CademiKPI] Access last 30 days: ${accessLast30Days}`);
    console.log(`[CademiKPI] Never accessed: ${neverAccessed}`);
    console.log(`[CademiKPI] Top active students: ${activeStudents.length}`);

    return {
      totalStudents,
      studentsVariation,
      newStudentsLast30Days,
      accessLast30Days,
      accessDistribution,
      neverAccessed,
      topActiveStudents: activeStudents,
      totalCourses,
    };
  } catch (error) {
    console.error('[CademiKPI] Failed to calculate KPIs:', error);
    throw error;
  }
}
