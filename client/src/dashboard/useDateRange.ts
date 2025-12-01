/**
 * useDateRange Hook
 * 
 * Hook global para gerenciar o período selecionado no dashboard.
 * Persiste a seleção no localStorage por empresa.
 */

import { useState, useEffect } from 'react';
import { DateRange, DatePreset, getPresetRange } from './dateRange';

const STORAGE_KEY_PREFIX = 'dash-kpi-daterange';

/**
 * Hook para gerenciar o período selecionado no dashboard
 * 
 * @param companySlug - Slug da empresa (para persistência isolada)
 * @param defaultPreset - Preset padrão (default: "last_30_days")
 */
export function useDateRange(companySlug: string, defaultPreset: DatePreset = "last_30_days") {
  const storageKey = `${STORAGE_KEY_PREFIX}-${companySlug}`;

  // Inicializar estado com valor do localStorage ou preset padrão
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as DateRange;
        // Validar que o range armazenado ainda é válido
        if (parsed.from && parsed.to) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Erro ao carregar período do localStorage:', error);
    }
    return getPresetRange(defaultPreset);
  });

  // Persistir no localStorage quando o dateRange mudar
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(dateRange));
    } catch (error) {
      console.error('Erro ao salvar período no localStorage:', error);
    }
  }, [dateRange, storageKey]);

  /**
   * Atualizar o período com um preset
   */
  const setPreset = (preset: DatePreset) => {
    setDateRange(getPresetRange(preset));
  };

  /**
   * Atualizar o período com datas customizadas
   */
  const setCustomRange = (from: string, to: string) => {
    setDateRange({
      from,
      to,
      preset: "custom",
    });
  };

  return {
    dateRange,
    setDateRange,
    setPreset,
    setCustomRange,
  };
}
