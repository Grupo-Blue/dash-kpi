/**
 * Date Range Types and Helpers
 * 
 * Tipos e funções utilitárias para manipulação de períodos no dashboard.
 */

export type DatePreset =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "this_month"
  | "this_quarter"
  | "ytd"
  | "custom";

export type DateRange = {
  from: string; // ISO "2025-01-01"
  to: string;   // ISO "2025-01-31"
  preset?: DatePreset;
};

/**
 * Gera um DateRange baseado em um preset
 */
export function getPresetRange(preset: DatePreset): DateRange {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let from: Date;
  let to: Date = new Date(today);

  switch (preset) {
    case "today":
      from = new Date(today);
      break;

    case "yesterday":
      from = new Date(today);
      from.setDate(from.getDate() - 1);
      to = new Date(from);
      break;

    case "last_7_days":
      from = new Date(today);
      from.setDate(from.getDate() - 6); // 6 dias atrás + hoje = 7 dias
      break;

    case "last_30_days":
      from = new Date(today);
      from.setDate(from.getDate() - 29); // 29 dias atrás + hoje = 30 dias
      break;

    case "this_month":
      from = new Date(today.getFullYear(), today.getMonth(), 1);
      break;

    case "this_quarter":
      const currentQuarter = Math.floor(today.getMonth() / 3);
      from = new Date(today.getFullYear(), currentQuarter * 3, 1);
      break;

    case "ytd":
      from = new Date(today.getFullYear(), 0, 1); // 1º de janeiro
      break;

    case "custom":
      // Para custom, retornar last_30_days como padrão
      from = new Date(today);
      from.setDate(from.getDate() - 29);
      break;
  }

  return {
    from: formatDateISO(from),
    to: formatDateISO(to),
    preset,
  };
}

/**
 * Formata uma data para o formato ISO (YYYY-MM-DD)
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converte um DateRange para um formato legível
 */
export function formatDateRangeLabel(dateRange: DateRange): string {
  const presetLabels: Record<DatePreset, string> = {
    today: "Hoje",
    yesterday: "Ontem",
    last_7_days: "Últimos 7 dias",
    last_30_days: "Últimos 30 dias",
    this_month: "Este mês",
    this_quarter: "Este trimestre",
    ytd: "Ano até hoje",
    custom: "Personalizado",
  };

  if (dateRange.preset && dateRange.preset !== "custom") {
    return presetLabels[dateRange.preset];
  }

  // Para custom ou sem preset, mostrar o range
  const fromDate = new Date(dateRange.from);
  const toDate = new Date(dateRange.to);
  
  const fromFormatted = fromDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const toFormatted = toDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  
  return `${fromFormatted} - ${toFormatted}`;
}

/**
 * Calcula o período anterior de mesma duração (para comparação)
 */
export function getPreviousPeriod(dateRange: DateRange): DateRange {
  const from = new Date(dateRange.from);
  const to = new Date(dateRange.to);
  
  // Calcular duração em dias
  const duration = Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Período anterior termina 1 dia antes do início do período atual
  const prevTo = new Date(from);
  prevTo.setDate(prevTo.getDate() - 1);
  
  // Período anterior começa N dias antes do fim do período anterior
  const prevFrom = new Date(prevTo);
  prevFrom.setDate(prevFrom.getDate() - duration + 1);
  
  return {
    from: formatDateISO(prevFrom),
    to: formatDateISO(prevTo),
    preset: "custom",
  };
}
