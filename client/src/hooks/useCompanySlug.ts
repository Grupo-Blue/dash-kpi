import { useLocation } from "wouter";

/**
 * Hook para extrair o slug da empresa da URL atual
 * Mapeia rotas para slugs de empresas
 */
export function useCompanySlug(): string | null {
  const [location] = useLocation();
  
  const routeToSlugMap: Record<string, string> = {
    '/blue-consult': 'blue-consult',
    '/tokeniza': 'tokeniza',
    '/tokeniza-academy': 'tokeniza-academy',
    '/mychel-mendes': 'mychel-mendes',
  };
  
  return routeToSlugMap[location] || null;
}
