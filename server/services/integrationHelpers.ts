/**
 * Integration Helpers
 * 
 * Helpers to get service instances with credentials from integrations table
 * Falls back to ENV variables if not configured in DB
 */

import { getIntegrationCredentials } from '../db';
import { IntegrationFactory } from './integrations';
import { ENV } from '../_core/env';
import type { 
  PipedriveCredentials, 
  NiboCredentials, 
  MetricoolCredentials, 
  DiscordCredentials,
  TokenizaCredentials,
  TokenizaAcademyCredentials,
  MauticCredentials
} from './integrationTypes';

/**
 * Get Pipedrive service with credentials from DB or ENV
 */
export async function getPipedriveServiceForUser(userId?: number) {
  const integration = await getIntegrationCredentials('pipedrive');
  const apiToken = (integration?.config?.credentials as PipedriveCredentials)?.apiToken 
    || integration?.apiKey 
    || ENV.pipedriveApiToken;
  
  if (!apiToken) {
    throw new Error('Pipedrive não configurado. Configure as credenciais na tela de Integrações.');
  }
  
  return IntegrationFactory.createService('pipedrive', {
    apiKey: apiToken,
    config: integration?.config || {},
  });
}

/**
 * Get Nibo service with credentials from DB or ENV
 */
export async function getNiboServiceForUser(userId?: number) {
  const integration = await getIntegrationCredentials('nibo');
  const apiToken = (integration?.config?.credentials as NiboCredentials)?.apiToken 
    || integration?.apiKey 
    || ENV.niboApiToken;
  
  if (!apiToken) {
    throw new Error('Nibo não configurado. Configure as credenciais na tela de Integrações.');
  }
  
  return IntegrationFactory.createService('nibo', {
    apiKey: apiToken,
    config: integration?.config || {},
  });
}

/**
 * Get Metricool service with credentials from DB or ENV
 */
export async function getMetricoolServiceForUser(userId?: number) {
  const integration = await getIntegrationCredentials('metricool');
  const creds = integration?.config?.credentials as MetricoolCredentials | undefined;
  
  const apiKey = creds?.apiKey || ENV.metricoolApiToken;
  const userId_str = creds?.userId || ENV.metricoolUserId;
  
  if (!apiKey || !userId_str) {
    throw new Error('Metricool não configurado. Configure as credenciais na tela de Integrações.');
  }
  
  return IntegrationFactory.createService('metricool', {
    config: {
      credentials: {
        apiKey,
        userId: userId_str,
      },
    },
  });
}

/**
 * Get Discord service with credentials from DB or ENV
 */
export async function getDiscordServiceForUser(userId?: number) {
  const integration = await getIntegrationCredentials('discord');
  const creds = integration?.config?.credentials as DiscordCredentials | undefined;
  
  const botToken = creds?.botToken || ENV.discordBotToken;
  const guildId = creds?.guildId || ENV.discordGuildId;
  
  if (!botToken || !guildId) {
    throw new Error('Discord não configurado. Configure as credenciais na tela de Integrações.');
  }
  
  return IntegrationFactory.createService('discord', {
    config: {
      credentials: {
        botToken,
        guildId,
      },
    },
  });
}

/**
 * Get Tokeniza service with credentials from DB or ENV
 */
export async function getTokenizaServiceForUser(userId?: number) {
  const integration = await getIntegrationCredentials('tokeniza');
  const creds = integration?.config?.credentials as TokenizaCredentials | undefined;
  
  const apiToken = creds?.apiToken || ENV.tokenizaApiToken;
  const baseUrl = creds?.baseUrl;
  
  if (!apiToken) {
    throw new Error('Tokeniza não configurado. Configure as credenciais na tela de Integrações.');
  }
  
  return IntegrationFactory.createService('tokeniza', {
    config: {
      credentials: {
        apiToken,
        baseUrl,
      },
    },
  });
}

/**
 * Get Tokeniza Academy service with credentials from DB or ENV
 */
export async function getTokenizaAcademyServiceForUser(userId?: number) {
  const integration = await getIntegrationCredentials('tokeniza-academy');
  const creds = integration?.config?.credentials as TokenizaAcademyCredentials | undefined;
  
  const apiToken = creds?.apiToken || ENV.tokenizaAcademyApiToken;
  const baseUrl = creds?.baseUrl;
  
  if (!apiToken) {
    throw new Error('Tokeniza Academy não configurado. Configure as credenciais na tela de Integrações.');
  }
  
  return IntegrationFactory.createService('tokeniza-academy', {
    config: {
      credentials: {
        apiToken,
        baseUrl,
      },
    },
  });
}

/**
 * Get Mautic service with credentials from DB or ENV
 */
export async function getMauticServiceForUser(userId?: number) {
  const integration = await getIntegrationCredentials('mautic');
  const creds = integration?.config?.credentials as MauticCredentials | undefined;
  
  const baseUrl = creds?.baseUrl || ENV.mauticBaseUrl;
  const clientId = creds?.clientId || ENV.mauticClientId;
  const clientSecret = creds?.clientSecret || ENV.mauticClientSecret;
  
  if (!baseUrl || !clientId || !clientSecret) {
    throw new Error('Mautic não configurado. Configure as credenciais na tela de Integrações.');
  }
  
  return IntegrationFactory.createService('mautic', {
    config: {
      credentials: {
        baseUrl,
        clientId,
        clientSecret,
        username: creds?.username,
        password: creds?.password,
      },
    },
  });
}
