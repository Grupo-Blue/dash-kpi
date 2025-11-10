import { mauticService, MauticContact, MauticActivityEvent, MauticCampaign, MauticSegment } from './mauticService';
import { PipedriveService } from './integrations';
import { ENV } from '../_core/env';
import {
  getLeadJourneyCache,
  saveLeadJourneyCache,
  saveLeadJourneySearch,
} from '../db/leadJourneyDb';

export interface LeadJourneyData {
  // Dados do Mautic
  mautic: {
    contact: MauticContact | null;
    activities: MauticActivityEvent[];
    campaigns: MauticCampaign[];
    segments: MauticSegment[];
  };
  // Dados do Pipedrive
  pipedrive: {
    person: any | null;
    deals: any[];
    wonDeal: any | null; // Deal ganho (se houver)
  };
  // Métricas calculadas
  metrics: {
    daysInBase: number;
    daysToConversion: number | null;
    conversionStatus: 'lead' | 'negotiating' | 'won' | 'lost';
    dealValue: number | null;
    totalActivities: number;
    emailsSent: number;
    emailsOpened: number;
    pagesVisited: number;
    formsSubmitted: number;
    downloadsCompleted: number;
    videosWatched: number;
    pointsGained: number;
  };
}

/**
 * Serviço de análise de jornada de leads
 * Cruza dados do Mautic com Pipedrive
 */
class LeadJourneyService {
  private pipedriveService: PipedriveService;

  constructor() {
    // Inicializar PipedriveService com token do ambiente
    const pipedriveToken = ENV.pipedriveApiToken || process.env.PIPEDRIVE_API_TOKEN || '';
    this.pipedriveService = new PipedriveService(pipedriveToken);
  }
  /**
   * Buscar jornada completa de um lead por e-mail
   */
  async getLeadJourney(email: string, userId: number, useCache: boolean = true): Promise<LeadJourneyData | null> {
    try {
      // 1. Verificar cache (se habilitado)
      if (useCache) {
        const cached = await getLeadJourneyCache(email);
        if (cached && cached.mauticData && cached.pipedriveData) {
          console.log('[LeadJourney] Using cached data');
          return this.buildLeadJourneyData(
            cached.mauticData as any,
            cached.pipedriveData as any
          );
        }
      }

      // 2. Buscar dados do Mautic
      console.log('[LeadJourney] Fetching Mautic data for:', email);
      const mauticData = await mauticService.getLeadJourney(email);

      if (!mauticData) {
        console.log('[LeadJourney] Lead not found in Mautic');
        return null;
      }

      // 3. Buscar dados do Pipedrive
      console.log('[LeadJourney] Fetching Pipedrive data for:', email);
      const pipedriveData = await this.getPipedriveDataByEmail(email);

      // 4. Construir dados completos
      const journeyData = this.buildLeadJourneyData(mauticData, pipedriveData);

      // 5. Salvar no cache (24 horas)
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas

      await saveLeadJourneyCache({
        email,
        mauticData: mauticData as any,
        pipedriveData: pipedriveData as any,
        aiAnalysis: null, // Será preenchido depois
        cachedAt: now,
        expiresAt,
      });

      // 6. Salvar no histórico de pesquisas
      await saveLeadJourneySearch({
        email,
        leadName: mauticData.contact.fields.all.firstname 
          ? `${mauticData.contact.fields.all.firstname} ${mauticData.contact.fields.all.lastname || ''}`.trim()
          : mauticData.contact.fields.all.email || email,
        mauticId: mauticData.contact.id,
        pipedrivePersonId: pipedriveData.person?.id || null,
        pipedriveDealId: pipedriveData.wonDeal?.id || null,
        conversionStatus: journeyData.metrics.conversionStatus,
        dealValue: journeyData.metrics.dealValue,
        daysInBase: journeyData.metrics.daysInBase,
        daysToConversion: journeyData.metrics.daysToConversion,
        searchedBy: userId,
      });

      return journeyData;
    } catch (error: any) {
      console.error('[LeadJourney] Error getting lead journey:', error.message);
      throw error;
    }
  }

  /**
   * Buscar dados do Pipedrive por e-mail
   */
  private async getPipedriveDataByEmail(email: string): Promise<{
    person: any | null;
    deals: any[];
    wonDeal: any | null;
  }> {
    try {
      // Buscar person por e-mail
      const personsResponse = await pipedriveService.searchPersons(email);
      
      if (!personsResponse.success || !personsResponse.data || personsResponse.data.length === 0) {
        return {
          person: null,
          deals: [],
          wonDeal: null,
        };
      }

      const person = personsResponse.data[0];

      // Buscar deals da person
      const dealsResponse = await pipedriveService.getPersonDeals(person.id);
      const deals = dealsResponse.success ? dealsResponse.data : [];

      // Encontrar deal ganho (se houver)
      const wonDeal = deals.find((deal: any) => deal.status === 'won') || null;

      return {
        person,
        deals,
        wonDeal,
      };
    } catch (error: any) {
      console.error('[LeadJourney] Error getting Pipedrive data:', error.message);
      return {
        person: null,
        deals: [],
        wonDeal: null,
      };
    }
  }

  /**
   * Construir dados completos da jornada
   */
  private buildLeadJourneyData(
    mauticData: {
      contact: MauticContact;
      activities: MauticActivityEvent[];
      campaigns: MauticCampaign[];
      segments: MauticSegment[];
    },
    pipedriveData: {
      person: any | null;
      deals: any[];
      wonDeal: any | null;
    }
  ): LeadJourneyData {
    // Calcular métricas
    const daysInBase = this.calculateDaysInBase(mauticData.contact.dateAdded);
    const daysToConversion = pipedriveData.wonDeal
      ? this.calculateDaysToConversion(mauticData.contact.dateAdded, pipedriveData.wonDeal.won_time)
      : null;

    // Determinar status de conversão
    let conversionStatus: 'lead' | 'negotiating' | 'won' | 'lost' = 'lead';
    if (pipedriveData.wonDeal) {
      conversionStatus = 'won';
    } else if (pipedriveData.deals.some((d: any) => d.status === 'lost')) {
      conversionStatus = 'lost';
    } else if (pipedriveData.deals.some((d: any) => d.status === 'open')) {
      conversionStatus = 'negotiating';
    }

    // Contar atividades por tipo
    const emailsSent = mauticData.activities.filter(a => a.event === 'email.sent').length;
    const emailsOpened = mauticData.activities.filter(a => a.event === 'email.read').length;
    const pagesVisited = mauticData.activities.filter(a => a.event === 'page.hit').length;
    const formsSubmitted = mauticData.activities.filter(a => a.event === 'form.submitted').length;
    const downloadsCompleted = mauticData.activities.filter(a => a.event === 'asset.download').length;
    const videosWatched = mauticData.activities.filter(a => a.event === 'page.videohit').length;
    const pointsGained = mauticData.activities.filter(a => a.event === 'point.gained').length;

    return {
      mautic: mauticData,
      pipedrive: pipedriveData,
      metrics: {
        daysInBase,
        daysToConversion,
        conversionStatus,
        dealValue: pipedriveData.wonDeal?.value || null,
        totalActivities: mauticData.activities.length,
        emailsSent,
        emailsOpened,
        pagesVisited,
        formsSubmitted,
        downloadsCompleted,
        videosWatched,
        pointsGained,
      },
    };
  }

  /**
   * Calcular dias na base
   */
  private calculateDaysInBase(dateAdded: string): number {
    const added = new Date(dateAdded);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - added.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Calcular dias até conversão
   */
  private calculateDaysToConversion(dateAdded: string, wonTime: string): number {
    const added = new Date(dateAdded);
    const won = new Date(wonTime);
    const diffTime = Math.abs(won.getTime() - added.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}

export const leadJourneyService = new LeadJourneyService();
