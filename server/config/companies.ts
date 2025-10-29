/**
 * Configuração centralizada de empresas e suas redes sociais conectadas no Metricool
 * 
 * IMPORTANTE: Sempre usar o MCP do Metricool como base para verificar redes conectadas
 */

export interface CompanyConfig {
  name: string;
  blogId: string;
  userId: string;
  connectedNetworks: string[];
  description: string;
}

export const COMPANIES: Record<string, CompanyConfig> = {
  MYCHEL_MENDES: {
    name: 'Mychel Mendes',
    blogId: '3893476',
    userId: '3061390',
    connectedNetworks: ['site', 'facebook', 'instagram', 'threads', 'twitter', 'linkedin', 'tiktok', 'youtube'],
    description: 'Influenciador digital - 8 redes sociais conectadas'
  },
  
  BLUE_CONSULT: {
    name: 'Blue Consult',
    blogId: '3893423',
    userId: '3061390',
    connectedNetworks: ['site', 'facebook', 'instagram', 'youtube', 'meta_ads', 'google_ads'],
    description: 'Consultoria em IR Cripto - 6 canais conectados'
  },
  
  TOKENIZA: {
    name: 'Tokeniza',
    blogId: '3890487',
    userId: '3061390',
    connectedNetworks: ['facebook', 'instagram', 'twitter', 'youtube', 'meta_ads', 'google_ads'],
    description: 'Plataforma & Private - 6 canais conectados'
  },
  
  TOKENIZA_ACADEMY: {
    name: 'Tokeniza Academy',
    blogId: '3893327',
    userId: '3061390',
    connectedNetworks: ['facebook', 'instagram', 'twitter', 'meta_ads', 'google_ads'],
    description: 'Academy & Discord - 5 canais conectados'
  }
};

/**
 * Helper para verificar se uma rede está conectada para uma empresa
 */
export function isNetworkConnected(companyKey: string, network: string): boolean {
  const company = COMPANIES[companyKey];
  if (!company) return false;
  return company.connectedNetworks.includes(network.toLowerCase());
}

/**
 * Helper para obter configuração de uma empresa por blogId
 */
export function getCompanyByBlogId(blogId: string): CompanyConfig | undefined {
  return Object.values(COMPANIES).find(company => company.blogId === blogId);
}
