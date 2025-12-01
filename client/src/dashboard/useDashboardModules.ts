/**
 * useDashboardModules Hook
 * 
 * Hook para carregar os módulos de dashboard disponíveis para uma empresa
 * baseado nas integrações ativas.
 */

import { useQuery } from '@tanstack/react-query';
import { trpc } from '../lib/trpc';

export type DashboardModuleInfo = {
  id: string;
  title: string;
};

/**
 * Hook para carregar módulos de dashboard disponíveis
 * 
 * @param companySlug - Slug da empresa
 */
export function useDashboardModules(companySlug: string) {
  const query = trpc.dashboard.getModules.useQuery(
    { companySlug },
    {
      // Cachear por 5 minutos
      staleTime: 5 * 60 * 1000,
      // Revalidar quando a janela receber foco
      refetchOnWindowFocus: true,
      // Não revalidar automaticamente em intervalos
      refetchInterval: false,
    }
  );

  return {
    modules: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
