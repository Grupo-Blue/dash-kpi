import { trpc } from "@/lib/trpc";
import { useCompanySlug } from "./useCompanySlug";

/**
 * Hook para buscar dados da empresa baseado na rota atual
 * Retorna companyId e outras informações da empresa
 */
export function useCompanyData() {
  const companySlug = useCompanySlug();
  
  const { data: companies, isLoading } = trpc.companies.list.useQuery();
  
  const company = companies?.find(c => c.slug === companySlug);
  
  return {
    companyId: company?.id,
    companySlug,
    companyName: company?.name,
    isLoading,
  };
}
