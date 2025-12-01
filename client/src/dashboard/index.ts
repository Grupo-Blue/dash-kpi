/**
 * Dashboard Infrastructure
 * 
 * Exporta todos os tipos, hooks e helpers relacionados ao sistema de dashboard.
 */

// Date Range
export type { DateRange, DatePreset } from './dateRange';
export {
  getPresetRange,
  formatDateISO,
  formatDateRangeLabel,
  getPreviousPeriod,
} from './dateRange';

// Hooks
export { useDateRange } from './useDateRange';
export { useDashboardModules } from './useDashboardModules';
export type { DashboardModuleInfo } from './useDashboardModules';
