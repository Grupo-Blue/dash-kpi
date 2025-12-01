/**
 * Integration Helpers
 * 
 * Sprint I4: Refatorado para usar companySlug em vez de userId
 * Helpers to get service instances with credentials from integrations table per company
 * Falls back to ENV variables if not configured in DB
 */

import { getIntegrationCredentials, getCompanyBySlug } from '../db';
import { IntegrationFactory } from './integrations';
import { ENV } from '../_core/env';
import type { 
  PipedriveCredentials, 
  NiboCredentials, 
  MetricoolCredentials, 
  DiscordCredentials,
  TokenizaCredentials,
  TokenizaAcademyCredentials,
  MauticCredentials,
  YouTubeCredentials
} from './integrationTypes';
import { YouTubeService } from './youtube.service';

/**
 * Get Pipedrive service with credentials from DB or ENV
 */
export async function getPipedriveServiceForCompany(companySlug: string) {
  const company = await getCompanyBySlug(companySlug);
  if (!company) {
    throw new Error(`Empresa não encontrada: ${companySlug}`);
  }

  const integration = await getIntegrationCredentials('pipedrive', company.id);
  const apiToken = (integration?.config?.credentials as PipedriveCredentials)?.apiToken 
    || ENV.pipedriveApiToken; // fallback to ENV
  
  if (!apiToken) {
    throw new Error(`Pipedrive não configurado para a empresa ${company.name}. Configure as credenciais na tela de Integrações.`);
  }
  
  return IntegrationFactory.createService('pipedrive', {
    apiKey: apiToken,
    config: integration?.config || {},
  });
}

/**
 * Get Nibo service with credentials from DB or ENV
 */
export async function getNiboServiceForCompany(companySlug: string) {
  const company = await getCompanyBySlug(companySlug);
  if (!company) {
    throw new Error(`Empresa não encontrada: ${companySlug}`);
  }

  const integration = await getIntegrationCredentials('nibo', company.id);
  const apiToken = (integration?.config?.credentials as NiboCredentials)?.apiToken 
    || ENV.niboApiToken;
  
  if (!apiToken) {
    throw new Error(`Nibo não configurado para a empresa ${company.name}. Configure as credenciais na tela de Integrações.`);
  }
  
  return IntegrationFactory.createService('nibo', {
    apiKey: apiToken,
    config: integration?.config || {},
  });
}

/**
 * Get Metricool service with credentials from DB or ENV
 */
export async function getMetricoolServiceForCompany(companySlug: string) {
  const company = await getCompanyBySlug(companySlug);
  if (!company) {
    throw new Error(`Empresa não encontrada: ${companySlug}`);
  }

  const integration = await getIntegrationCredentials('metricool', company.id);
  const credentials = integration?.config?.credentials as MetricoolCredentials | undefined;
  
  const apiKey = credentials?.apiKey || ENV.metricoolApiToken;
  const userId = credentials?.userId || ENV.metricoolUserId;
  
  if (!apiKey || !userId) {
    throw new Error(`Metricool não configurado para a empresa ${company.name}. Configure as credenciais na tela de Integrações.`);
  }
  
  return IntegrationFactory.createService('metricool', {
    apiKey,
    config: {
      credentials: { apiKey, userId }
    },
  });
}

/**
 * Get Discord service with credentials from DB or ENV
 */
export async function getDiscordServiceForCompany(companySlug: string) {
  const company = await getCompanyBySlug(companySlug);
  if (!company) {
    throw new Error(`Empresa não encontrada: ${companySlug}`);
  }

  const integration = await getIntegrationCredentials('discord', company.id);
  const credentials = integration?.config?.credentials as DiscordCredentials | undefined;
  
  const botToken = credentials?.botToken || ENV.discordBotToken;
  const guildId = credentials?.guildId || ENV.discordGuildId;
  
  if (!botToken || !guildId) {
    throw new Error(`Discord não configurado para a empresa ${company.name}. Configure as credenciais na tela de Integrações.`);
  }
  
  return IntegrationFactory.createService('discord', {
    apiKey: botToken,
    config: {
      credentials: { botToken, guildId }
    },
  });
}

/**
 * Get Tokeniza service with credentials from DB or ENV
 */
export async function getTokenizaServiceForCompany(companySlug: string) {
  const company = await getCompanyBySlug(companySlug);
  if (!company) {
    throw new Error(`Empresa não encontrada: ${companySlug}`);
  }

  const integration = await getIntegrationCredentials('tokeniza', company.id);
  const apiToken = (integration?.config?.credentials as TokenizaCredentials)?.apiToken 
    || ENV.tokenizaApiToken;
  
  if (!apiToken) {
    throw new Error(`Tokeniza não configurado para a empresa ${company.name}. Configure as credenciais na tela de Integrações.`);
  }
  
  return IntegrationFactory.createService('tokeniza', {
    apiKey: apiToken,
    config: integration?.config || {},
  });
}

/**
 * Get Tokeniza Academy (Cademi) service with credentials from DB or ENV
 */
export async function getTokenizaAcademyServiceForCompany(companySlug: string) {
  const company = await getCompanyBySlug(companySlug);
  if (!company) {
    throw new Error(`Empresa não encontrada: ${companySlug}`);
  }

  const integration = await getIntegrationCredentials('tokeniza-academy', company.id);
  const credentials = integration?.config?.credentials as TokenizaAcademyCredentials | undefined;
  
  const apiToken = credentials?.apiToken || ENV.tokenizaAcademyApiToken;
  const baseUrl = credentials?.baseUrl;
  
  if (!apiToken) {
    throw new Error(`Tokeniza Academy não configurado para a empresa ${company.name}. Configure as credenciais na tela de Integrações.`);
  }
  
  return IntegrationFactory.createService('tokeniza-academy', {
    apiKey: apiToken,
    config: {
      credentials: { apiToken, baseUrl }
    },
  });
}

/**
 * Get Mautic service with credentials from DB or ENV
 */
export async function getMauticServiceForCompany(companySlug: string) {
  const company = await getCompanyBySlug(companySlug);
  if (!company) {
    throw new Error(`Empresa não encontrada: ${companySlug}`);
  }

  const integration = await getIntegrationCredentials('mautic', company.id);
  const credentials = integration?.config?.credentials as MauticCredentials | undefined;
  
  const baseUrl = credentials?.baseUrl || ENV.mauticBaseUrl;
  const clientId = credentials?.clientId || ENV.mauticClientId;
  const clientSecret = credentials?.clientSecret || ENV.mauticClientSecret;
  
  if (!baseUrl || !clientId || !clientSecret) {
    throw new Error(`Mautic não configurado para a empresa ${company.name}. Configure as credenciais na tela de Integrações.`);
  }
  
  return IntegrationFactory.createService('mautic', {
    apiKey: null,
    config: {
      credentials: { baseUrl, clientId, clientSecret }
    },
  });
}

/**
 * @deprecated Use getPipedriveServiceForCompany(companySlug) instead
 * Backward compatibility: defaults to 'blue-consult'
 */
export async function getPipedriveServiceForUser(userId?: number) {
  return getPipedriveServiceForCompany('blue-consult');
}

/**
 * @deprecated Use getNiboServiceForCompany(companySlug) instead
 * Backward compatibility: defaults to 'blue-consult'
 */
export async function getNiboServiceForUser(userId?: number) {
  return getNiboServiceForCompany('blue-consult');
}

/**
 * @deprecated Use getMetricoolServiceForCompany(companySlug) instead
 * Backward compatibility: defaults to 'blue-consult'
 */
export async function getMetricoolServiceForUser(userId?: number) {
  return getMetricoolServiceForCompany('blue-consult');
}

/**
 * @deprecated Use getDiscordServiceForCompany(companySlug) instead
 * Backward compatibility: defaults to 'blue-consult'
 */
export async function getDiscordServiceForUser(userId?: number) {
  return getDiscordServiceForCompany('blue-consult');
}

/**
 * @deprecated Use getTokenizaServiceForCompany(companySlug) instead
 * Backward compatibility: defaults to 'tokeniza'
 */
export async function getTokenizaServiceForUser(userId?: number) {
  return getTokenizaServiceForCompany('tokeniza');
}

/**
 * @deprecated Use getTokenizaAcademyServiceForCompany(companySlug) instead
 * Backward compatibility: defaults to 'tokeniza'
 */
export async function getTokenizaAcademyServiceForUser(userId?: number) {
  return getTokenizaAcademyServiceForCompany('tokeniza');
}

/**
 * @deprecated Use getMauticServiceForCompany(companySlug) instead
 * Backward compatibility: defaults to 'blue-consult'
 */
export async function getMauticServiceForUser(userId?: number) {
  return getMauticServiceForCompany('blue-consult');
}

/**
 * Get YouTube service with credentials from DB or ENV
 */
export async function getYouTubeServiceForCompany(companySlug: string) {
  const company = await getCompanyBySlug(companySlug);
  if (!company) {
    throw new Error(`Empresa não encontrada: ${companySlug}`);
  }

  const integration = await getIntegrationCredentials('youtube', company.id);
  const apiKey = (integration?.config?.credentials as YouTubeCredentials)?.apiKey 
    || ENV.youtubeApiKey;
  
  if (!apiKey) {
    throw new Error(`YouTube não configurado para a empresa ${company.name}. Configure as credenciais na tela de Integrações.`);
  }
  
  return new YouTubeService(apiKey);
}

/**
 * @deprecated Use getYouTubeServiceForCompany(companySlug) instead
 * Backward compatibility: defaults to 'blue-consult'
 */
export async function getYouTubeServiceForUser(userId?: number) {
  return getYouTubeServiceForCompany('blue-consult');
}
