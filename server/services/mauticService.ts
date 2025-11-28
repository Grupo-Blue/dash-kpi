import axios, { AxiosInstance } from 'axios';
import { ENV } from '../_core/env';

import { logger } from '../utils/logger';
/**
 * Serviço de integração com Mautic API
 * 
 * Documentação: https://developer.mautic.org/
 * 
 * Endpoints principais:
 * - GET /api/contacts?search=email:exemplo@email.com - Buscar lead por e-mail
 * - GET /api/contacts/:id - Obter dados completos do lead
 * - GET /api/contacts/:id/activity - Obter timeline de atividades
 * - GET /api/contacts/:id/campaigns - Obter campanhas
 * - GET /api/contacts/:id/segments - Obter segmentos
 */

export interface MauticContact {
  id: number;
  isPublished: boolean;
  dateAdded: string;
  createdBy: number;
  createdByUser: string;
  dateModified: string | null;
  modifiedBy: number | null;
  modifiedByUser: string | null;
  owner: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  } | null;
  points: number;
  lastActive: string | null;
  dateIdentified: string | null;
  color: string;
  ipAddresses: Record<string, any>;
  fields: {
    core: Record<string, any>;
    social: Record<string, any>;
    personal: Record<string, any>;
    professional: Record<string, any>;
    all: Record<string, any>;
  };
  tags: any[];
  utmtags: any[];
  doNotContact: any[];
}

export interface MauticActivityEvent {
  event: string;
  icon: string;
  eventType: string;
  eventPriority: number;
  timestamp: string;
  featured: boolean;
  contactId?: number;
  details?: Record<string, any>;
}

export interface MauticActivityResponse {
  events: MauticActivityEvent[];
  filters: {
    search: string;
    includeEvents: string[];
    excludeEvents: string[];
  };
  order: [string, string];
  types: Record<string, string>;
  total: number;
  page: number;
  limit: number;
  maxPages: number;
}

export interface MauticCampaign {
  id: number;
  name: string;
  description: string | null;
  isPublished: boolean;
  dateAdded: string;
  createdBy: number;
  createdByUser: string;
}

export interface MauticSegment {
  id: number;
  name: string;
  alias: string;
  description: string | null;
  isPublished: boolean;
  dateAdded: string;
  createdBy: number;
  createdByUser: string;
}

class MauticService {
  private client: AxiosInstance;
  private baseURL: string;
  private username: string;
  private password: string;

  constructor() {
    // Credenciais OAuth2 do Mautic
    this.baseURL = 'https://mautic.grupoblue.com.br';
    this.username = '8_16au3ocbjzvkcgk4w4ww4w8kwck0wok8gk8ow80gs8g04c8ooo';
    this.password = '5tkzuzbxq7wg8wsowcs4k8cgwccwwooc0kosc4k8o04og8gs0s';

    // Criar cliente axios com autenticação básica
    // Nota: Mautic suporta Basic Auth para API além de OAuth2
    this.client = axios.create({
      baseURL: this.baseURL,
      auth: {
        username: this.username,
        password: this.password,
      },
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 segundos
    });
  }

  /**
   * Buscar contato por e-mail
   */
  async searchContactByEmail(email: string): Promise<MauticContact | null> {
    try {
      const response = await this.client.get('/api/contacts', {
        params: {
          search: `email:${email}`,
          limit: 1,
        },
      });

      const contacts = response.data.contacts;
      if (!contacts || Object.keys(contacts).length === 0) {
        return null;
      }

      // Pegar o primeiro contato encontrado
      const contactId = Object.keys(contacts)[0];
      return contacts[contactId];
    } catch (error: any) {
      logger.error('[Mautic] Error searching contact by email:', error.response?.data || error.message);
      throw new Error(`Failed to search contact: ${error.message}`);
    }
  }

  /**
   * Obter dados completos de um contato por ID
   */
  async getContact(contactId: number): Promise<MauticContact> {
    try {
      const response = await this.client.get(`/api/contacts/${contactId}`);
      return response.data.contact;
    } catch (error: any) {
      logger.error('[Mautic] Error getting contact:', error.response?.data || error.message);
      throw new Error(`Failed to get contact: ${error.message}`);
    }
  }

  /**
   * Obter timeline de atividades de um contato
   */
  async getContactActivity(
    contactId: number,
    options?: {
      search?: string;
      includeEvents?: string[];
      excludeEvents?: string[];
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<MauticActivityResponse> {
    try {
      const params: any = {
        page: options?.page || 1,
        limit: options?.limit || 100,
      };

      if (options?.search) {
        params['filters[search]'] = options.search;
      }

      if (options?.includeEvents && options.includeEvents.length > 0) {
        options.includeEvents.forEach((event, index) => {
          params[`filters[includeEvents][${index}]`] = event;
        });
      }

      if (options?.excludeEvents && options.excludeEvents.length > 0) {
        options.excludeEvents.forEach((event, index) => {
          params[`filters[excludeEvents][${index}]`] = event;
        });
      }

      if (options?.dateFrom) {
        params['filters[dateFrom]'] = options.dateFrom;
      }

      if (options?.dateTo) {
        params['filters[dateTo]'] = options.dateTo;
      }

      const response = await this.client.get(`/api/contacts/${contactId}/activity`, {
        params,
      });

      return response.data;
    } catch (error: any) {
      logger.error('[Mautic] Error getting contact activity:', error.response?.data || error.message);
      throw new Error(`Failed to get contact activity: ${error.message}`);
    }
  }

  /**
   * Obter todas as atividades de um contato (paginação automática)
   */
  async getAllContactActivity(
    contactId: number,
    options?: {
      includeEvents?: string[];
      excludeEvents?: string[];
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<MauticActivityEvent[]> {
    const allEvents: MauticActivityEvent[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.getContactActivity(contactId, {
        ...options,
        page,
        limit: 100,
      });

      allEvents.push(...response.events);

      // Verificar se há mais páginas
      if (page >= response.maxPages) {
        hasMore = false;
      } else {
        page++;
      }
    }

    return allEvents;
  }

  /**
   * Obter campanhas de um contato
   */
  async getContactCampaigns(contactId: number): Promise<MauticCampaign[]> {
    try {
      const response = await this.client.get(`/api/contacts/${contactId}/campaigns`);
      const campaigns = response.data.campaigns;

      if (!campaigns || Object.keys(campaigns).length === 0) {
        return [];
      }

      return Object.values(campaigns);
    } catch (error: any) {
      logger.error('[Mautic] Error getting contact campaigns:', error.response?.data || error.message);
      throw new Error(`Failed to get contact campaigns: ${error.message}`);
    }
  }

  /**
   * Obter segmentos de um contato
   */
  async getContactSegments(contactId: number): Promise<MauticSegment[]> {
    try {
      const response = await this.client.get(`/api/contacts/${contactId}/segments`);
      const segments = response.data.lists;

      if (!segments || Object.keys(segments).length === 0) {
        return [];
      }

      return Object.values(segments);
    } catch (error: any) {
      logger.error('[Mautic] Error getting contact segments:', error.response?.data || error.message);
      throw new Error(`Failed to get contact segments: ${error.message}`);
    }
  }

  /**
   * Obter dados completos de um lead (contato + atividades + campanhas + segmentos)
   */
  async getLeadJourney(email: string): Promise<{
    contact: MauticContact;
    activities: MauticActivityEvent[];
    campaigns: MauticCampaign[];
    segments: MauticSegment[];
  } | null> {
    try {
      // 1. Buscar contato por e-mail
      const contact = await this.searchContactByEmail(email);
      if (!contact) {
        return null;
      }

      // 2. Buscar atividades, campanhas e segmentos em paralelo
      const [activities, campaigns, segments] = await Promise.all([
        this.getAllContactActivity(contact.id),
        this.getContactCampaigns(contact.id),
        this.getContactSegments(contact.id),
      ]);

      return {
        contact,
        activities,
        campaigns,
        segments,
      };
    } catch (error: any) {
      logger.error('[Mautic] Error getting lead journey:', error.message);
      throw error;
    }
  }
}

// Exportar instância única do serviço
export const mauticService = new MauticService();
