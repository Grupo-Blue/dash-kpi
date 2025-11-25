import { mauticService, MauticContact, MauticActivityEvent, MauticCampaign, MauticSegment } from './mauticService';
import { mauticCacheService } from './mauticCacheService';
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
  // 🆕 ANÁLISE AVANÇADA - Origem e Aquisição
  acquisition: {
    firstTouch: {
      date: Date | null;
      utmSource: string | null;
      utmMedium: string | null;
      utmCampaign: string | null;
      utmContent: string | null;
      utmTerm: string | null;
      landingPage: string | null;
      referrer: string | null;
      device: string | null;
    };
    lastTouch: {
      date: Date | null;
      page: string | null;
      action: string | null;
    };
  };
  // 🆕 ANÁLISE AVANÇADA - Timeline Processada
  timeline: {
    events: TimelineEvent[];
    activityPeaks: { date: string; count: number }[];
    inactivePeriods: { start: Date; end: Date; days: number }[];
  };
  // 🆕 ANÁLISE AVANÇADA - Padrões de Comportamento
  behavior: {
    visitFrequency: 'daily' | 'weekly' | 'sporadic' | 'inactive';
    avgSessionDuration: number | null; // em minutos
    topPages: { url: string; visits: number }[];
    topContent: { title: string; type: string; views: number }[];
    engagementScore: number; // 0-100
    leadScoreHistory: { date: Date; score: number }[];
  };
  // 🆕 ANÁLISE AVANÇADA - Descadastros
  unsubscribe: {
    isUnsubscribed: boolean;
    unsubscribeDate: Date | null;
    unsubscribeReason: string | null;
    emailsBeforeUnsubscribe: number | null;
  };
  // Timestamp da última atualização
  lastUpdated: Date;
}

// 🆕 Interface para eventos da timeline
export interface TimelineEvent {
  id: string;
  date: Date;
  type: 'email_sent' | 'email_opened' | 'email_clicked' | 'page_visit' | 'form_submit' | 'download' | 'video_watch' | 'point_gained' | 'campaign_join' | 'segment_join' | 'unsubscribe';
  title: string;
  description?: string;
  metadata?: Record<string, any>;
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
          return await this.buildLeadJourneyData(
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
      const journeyData = await this.buildLeadJourneyData(mauticData, pipedriveData);

      // 5. Salvar no cache (24 horas)
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas

      await saveLeadJourneyCache({
        email,
        mauticData: mauticData as any,
        pipedriveData: pipedriveData as any,
        aiAnalysis: "", // Será preenchido depois
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
      console.log('[LeadJourney] Searching Pipedrive for email:', email);
      const personsResponse = await this.pipedriveService.searchPersons(email);
      console.log('[LeadJourney] Pipedrive search response:', JSON.stringify(personsResponse, null, 2));
      
      if (!personsResponse.success || !personsResponse.data || !personsResponse.data.items || personsResponse.data.items.length === 0) {
        console.log('[LeadJourney] No person found in Pipedrive');
        return {
          person: null,
          deals: [],
          wonDeal: null,
        };
      }

      const person = personsResponse.data.items[0].item;
      console.log('[LeadJourney] Person found:', person.id, person.name);

      // Buscar deals da person
      const dealsResponse = await this.pipedriveService.getPersonDeals(person.id);
      const deals = dealsResponse.success ? dealsResponse.data : [];

      // Encontrar deal ganho mais recente (se houver)
      const wonDeals = deals.filter((deal: any) => deal.status === 'won');
      const wonDeal = wonDeals.length > 0
        ? wonDeals.sort((a: any, b: any) => {
            const dateA = new Date(a.won_time || a.update_time || 0);
            const dateB = new Date(b.won_time || b.update_time || 0);
            return dateB.getTime() - dateA.getTime(); // Mais recente primeiro
          })[0]
        : null;
      
      if (wonDeal) {
        console.log('[LeadJourney] Won deal found:', wonDeal.title, 'Value:', wonDeal.value, 'Won time:', wonDeal.won_time);
      }

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
  private async buildLeadJourneyData(
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

    // 🆕 Adicionar acquisition ao mauticData ANTES de salvar
    const acquisition = this.analyzeAcquisition(mauticData.activities, mauticData.contact);
    console.log('[getLeadJourney] acquisition result:', JSON.stringify(acquisition, null, 2));
    
    // Adicionar acquisition ao mauticData
    (mauticData as any).acquisition = acquisition;

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
      // 🆕 ANÁLISE AVANÇADA (já incluído em mauticData.acquisition)
      acquisition,
      timeline: await this.buildTimeline(mauticData.activities, mauticData.campaigns, mauticData.segments),
      behavior: this.analyzeBehavior(mauticData.activities, mauticData.contact),
      unsubscribe: this.analyzeUnsubscribe(mauticData.activities, mauticData.contact),
      lastUpdated: new Date(),
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

  /**
   * 🆕 ANALISAR AQUISIÇÃO - Extrair UTMs e dados de origem
   */
  private analyzeAcquisition(activities: MauticActivityEvent[], contact: MauticContact): LeadJourneyData['acquisition'] {
    // Ordenar atividades por data (mais antiga primeiro)
    const sortedActivities = [...activities].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Primeira interação (first touch)
    const firstActivity = sortedActivities[0];
    const firstPageHit = sortedActivities.find(a => a.event === 'page.hit');
    
    // Última interação (last touch)
    const lastActivity = sortedActivities[sortedActivities.length - 1];

    // ✅ Extrair dados com mapeamento correto baseado na estrutura real do Mautic
    console.log('[analyzeAcquisition] firstPageHit exists?', !!firstPageHit);
    console.log('[analyzeAcquisition] firstPageHit.details exists?', !!firstPageHit?.details);
    console.log('[analyzeAcquisition] firstPageHit.details.hit exists?', !!(firstPageHit?.details as any)?.hit);
    if (firstPageHit?.details) {
      console.log('[analyzeAcquisition] firstPageHit.details keys:', Object.keys(firstPageHit.details));
    }
    
    const firstHit = (firstPageHit?.details as any)?.hit;
    const lastHit = (lastActivity?.details as any)?.hit;
    
    console.log('[analyzeAcquisition] firstHit exists?', !!firstHit);
    if (firstHit) {
      console.log('[analyzeAcquisition] firstHit FULL CONTENT:', JSON.stringify(firstHit, null, 2));
    }

    return {
      firstTouch: {
        date: firstActivity ? new Date(firstActivity.timestamp) : null,
        // UTMs estão em details.hit.query
        utmSource: firstHit?.query?.utm_source || null,
        utmMedium: firstHit?.query?.utm_medium || null,
        utmCampaign: firstHit?.query?.utm_campaign || null,
        utmContent: firstHit?.query?.utm_content || null,
        utmTerm: firstHit?.query?.utm_term || null,
        // Landing page está em details.hit.url ou details.hit.query.page_url
        landingPage: firstHit?.url || firstHit?.query?.page_url || null,
        // Referrer está em details.hit.source (ex: "email", "direct", "google")
        referrer: firstHit?.source || null,
        // Device está em details.hit.device (ex: "desktop", "mobile", "tablet")
        device: firstHit?.device || null,
      },
      lastTouch: {
        date: lastActivity ? new Date(lastActivity.timestamp) : null,
        // Página está em details.hit.url ou details.hit.query.page_url
        page: lastHit?.url || lastHit?.query?.page_url || null,
        action: lastActivity?.event || null,
      },
    };
  }

  /**
   * 🆕 CONSTRUIR TIMELINE - Processar eventos da jornada
   */
  private async buildTimeline(
    activities: MauticActivityEvent[],
    campaigns: MauticCampaign[],
    segments: MauticSegment[]
  ): Promise<LeadJourneyData['timeline']> {
    // Buscar todos os dados do cache (banco de dados)
    // Fallback: se cache estiver vazio, usa dados do lead
    let emailMap = await mauticCacheService.getAllEmailsMap();
    let segmentMap = await mauticCacheService.getAllSegmentsMap();
    let campaignMap = await mauticCacheService.getAllCampaignsMap();
    let stageMap = await mauticCacheService.getAllStagesMap();
    
    // Fallback: se cache estiver vazio, usa dados do lead
    if (emailMap.size === 0) {
      console.log('[LeadJourney] Email cache empty, fetching from API...');
      emailMap = await mauticService.getAllEmails(200);
    }
    
    if (segmentMap.size === 0) {
      console.log('[LeadJourney] Segment cache empty, using lead segments...');
      segmentMap = new Map(segments.map(s => [s.id, s.name]));
    }
    
    if (campaignMap.size === 0) {
      console.log('[LeadJourney] Campaign cache empty, using lead campaigns...');
      campaignMap = new Map(campaigns.map(c => [c.id, c.name]));
    }
    
    // Mapear atividades para eventos da timeline
    const events: TimelineEvent[] = activities.map((activity, index) => {
      let type: TimelineEvent['type'] = 'page_visit';
      let title = activity.event;
      let description = '';
      const details = activity.details as any;

      // Mapear tipos de eventos com nomes amigáveis
      if (activity.event === 'email.sent') {
        type = 'email_sent';
        const emailId = details?.email_id || details?.id;
        const emailName = emailId ? (emailMap.get(Number(emailId)) || details?.email_name || details?.subject || `E-mail #${emailId}`) : (details?.email_name || details?.subject || 'E-mail');
        title = `E-mail enviado: "${emailName}"`;
        description = details?.subject || '';
      } else if (activity.event === 'email.read') {
        type = 'email_opened';
        const emailId = details?.email_id || details?.id;
        const emailName = emailId ? (emailMap.get(Number(emailId)) || details?.email_name || details?.subject || `E-mail #${emailId}`) : (details?.email_name || details?.subject || 'E-mail');
        title = `Abriu o e-mail: "${emailName}"`;
        description = details?.subject || '';
      } else if (activity.event === 'email.clicked') {
        type = 'email_clicked';
        const emailId = details?.email_id || details?.id;
        const emailName = emailId ? (emailMap.get(Number(emailId)) || details?.email_name || details?.subject || `E-mail #${emailId}`) : (details?.email_name || details?.subject || 'E-mail');
        const url = details?.url || '';
        title = `Clicou em link do e-mail: "${emailName}"`;
        description = url;
      } else if (activity.event === 'page.hit') {
        type = 'page_visit';
        const url = details?.url || details?.page_url || '';
        const pageTitle = details?.page_title || this.extractPageName(url);
        title = `Visitou a página: "${pageTitle}"`;
        description = url;
      } else if (activity.event === 'form.submitted') {
        type = 'form_submit';
        const formName = details?.form_name || 'Formulário';
        title = `Enviou o formulário: "${formName}"`;
        description = details?.page_url || '';
      } else if (activity.event === 'asset.download') {
        type = 'download';
        const assetName = details?.asset_name || 'Material';
        title = `Baixou o material: "${assetName}"`;
        description = details?.url || '';
      } else if (activity.event === 'page.videohit') {
        type = 'video_watch';
        const videoTitle = details?.video_title || 'Vídeo';
        title = `Assistiu o vídeo: "${videoTitle}"`;
        description = details?.url || '';
      } else if (activity.event === 'point.gained') {
        type = 'point_gained';
        const points = details?.delta || 0;
        const reason = details?.event_name || 'atividade';
        title = `Ganhou ${points} pontos por ${reason}`;
        description = details?.details || '';
      } else if (activity.event === 'lead.source.identified') {
        type = 'page_visit';
        title = 'Lead identificado';
        description = `Origem: ${details?.source || 'desconhecida'}`;
      } else if (activity.event === 'segment_membership' || activity.event.includes('segment')) {
        type = 'segment_join';
        const segmentId = details?.segment_id || details?.id;
        const segmentName = segmentId ? (segmentMap.get(Number(segmentId)) || details?.segment_name || details?.name || `Segmento #${segmentId}`) : 'Segmento desconhecido';
        title = `Adicionado ao segmento: "${segmentName}"`;
        description = '';
      } else if (activity.event === 'lead.imported') {
        type = 'page_visit';
        title = 'Lead importado para o sistema';
        description = details?.source || '';
      } else if (activity.event === 'campaign.event' || activity.event.includes('campaign')) {
        type = 'campaign_join';
        const campaignId = details?.campaign_id || details?.id;
        const campaignName = campaignId ? (campaignMap.get(Number(campaignId)) || details?.campaign_name || details?.name || `Campanha #${campaignId}`) : 'Campanha desconhecida';
        const action = details?.event_type || details?.action || 'participou';
        const actionText = action === 'triggered' ? 'Entrou' : action === 'scheduled' ? 'Agendado' : action === 'action.triggered' ? 'Acionou ação' : 'Participou';
        title = `${actionText} na campanha: "${campaignName}"`;
        description = details?.description || '';
      } else if (activity.event === 'stage.changed') {
        type = 'page_visit';
        const stageId = details?.stage_id || details?.id;
        const oldStageId = details?.old_stage_id;
        const stageName = stageId ? (stageMap.get(Number(stageId)) || details?.stage_name || details?.name || `Estágio #${stageId}`) : (details?.stage_name || details?.name || 'Estágio');
        const oldStage = oldStageId ? (stageMap.get(Number(oldStageId)) || details?.old_stage || 'anterior') : (details?.old_stage || 'anterior');
        title = `Mudou de estágio: "${oldStage}" → "${stageName}"`;
        description = '';
      } else if (activity.event === 'lead.donotcontact') {
        type = 'page_visit';
        title = 'Marcado como "Não contactar"';
        description = details?.reason || '';
      } else if (activity.event === 'lead.utmtagsadded') {
        type = 'page_visit';
        title = 'Parâmetros UTM adicionados';
        description = `Source: ${details?.utm_source || '-'}, Medium: ${details?.utm_medium || '-'}`;
      }

      return {
        id: `${activity.event}-${index}`,
        date: new Date(activity.timestamp),
        type,
        title,
        description,
        metadata: activity.details,
      };
    });

    // Adicionar eventos de campanhas
    campaigns.forEach((campaign, index) => {
      events.push({
        id: `campaign-${index}`,
        date: new Date(campaign.dateAdded),
        type: 'campaign_join',
        title: 'Entrou na Campanha',
        description: campaign.name,
        metadata: campaign,
      });
    });

    // Adicionar eventos de segmentos
    segments.forEach((segment, index) => {
      events.push({
        id: `segment-${index}`,
        date: new Date(segment.dateAdded),
        type: 'segment_join',
        title: 'Adicionado ao Segmento',
        description: segment.name,
        metadata: segment,
      });
    });

    // Ordenar eventos por data
    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calcular picos de atividade (agrupar por dia)
    const activityByDay: Record<string, number> = {};
    events.forEach(event => {
      const day = event.date.toISOString().split('T')[0];
      activityByDay[day] = (activityByDay[day] || 0) + 1;
    });

    const activityPeaks = Object.entries(activityByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 dias mais ativos

    // Detectar períodos de inatividade (mais de 7 dias sem atividade)
    const inactivePeriods: { start: Date; end: Date; days: number }[] = [];
    for (let i = 1; i < events.length; i++) {
      const prevEvent = events[i - 1];
      const currentEvent = events[i];
      const daysDiff = Math.floor(
        (currentEvent.date.getTime() - prevEvent.date.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysDiff > 7) {
        inactivePeriods.push({
          start: prevEvent.date,
          end: currentEvent.date,
          days: daysDiff,
        });
      }
    }

    return {
      events,
      activityPeaks,
      inactivePeriods,
    };
  }

  /**
   * 🆕 ANALISAR COMPORTAMENTO - Padrões de engajamento
   */
  private analyzeBehavior(activities: MauticActivityEvent[], contact: MauticContact): LeadJourneyData['behavior'] {
    // Calcular frequência de visitas
    const pageHits = activities.filter(a => a.event === 'page.hit');
    const uniqueDays = new Set(
      pageHits.map(a => new Date(a.timestamp).toISOString().split('T')[0])
    ).size;
    
    const totalDays = this.calculateDaysInBase(contact.dateAdded);
    const visitFrequency: LeadJourneyData['behavior']['visitFrequency'] = 
      uniqueDays / totalDays > 0.7 ? 'daily' :
      uniqueDays / totalDays > 0.3 ? 'weekly' :
      uniqueDays > 0 ? 'sporadic' : 'inactive';

    // Top páginas visitadas
    const pageVisits: Record<string, number> = {};
    pageHits.forEach(hit => {
      const url = (hit.details as any)?.url || (hit.details as any)?.page_url || 'Unknown';
      pageVisits[url] = (pageVisits[url] || 0) + 1;
    });

    const topPages = Object.entries(pageVisits)
      .map(([url, visits]) => ({ url, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);

    // Top conteúdos (downloads, vídeos)
    const contentViews: Record<string, { type: string; views: number }> = {};
    
    activities.filter(a => a.event === 'asset.download').forEach(download => {
      const title = (download.details as any)?.asset_name || 'Unknown';
      if (!contentViews[title]) contentViews[title] = { type: 'Download', views: 0 };
      contentViews[title].views++;
    });

    activities.filter(a => a.event === 'page.videohit').forEach(video => {
      const title = (video.details as any)?.video_title || 'Unknown';
      if (!contentViews[title]) contentViews[title] = { type: 'Vídeo', views: 0 };
      contentViews[title].views++;
    });

    const topContent = Object.entries(contentViews)
      .map(([title, data]) => ({ title, type: data.type, views: data.views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Calcular engagement score (0-100)
    const emailEngagement = activities.filter(a => a.event === 'email.read').length / 
      Math.max(activities.filter(a => a.event === 'email.sent').length, 1);
    const formSubmissions = activities.filter(a => a.event === 'form.submitted').length;
    const downloads = activities.filter(a => a.event === 'asset.download').length;
    
    const engagementScore = Math.min(100, Math.round(
      (emailEngagement * 30) + 
      (formSubmissions * 20) + 
      (downloads * 15) + 
      (pageHits.length * 0.5)
    ));

    // Histórico de lead score (se disponível)
    const leadScoreHistory: { date: Date; score: number }[] = [];
    const pointEvents = activities.filter(a => a.event === 'point.gained');
    let cumulativeScore = 0;
    
    pointEvents.forEach(event => {
      cumulativeScore += (event.details as any)?.delta || 0;
      leadScoreHistory.push({
        date: new Date(event.timestamp),
        score: cumulativeScore,
      });
    });

    return {
      visitFrequency,
      avgSessionDuration: null, // Mautic não fornece duração de sessão
      topPages,
      topContent,
      engagementScore,
      leadScoreHistory,
    };
  }

  /**
   * Extrair nome amigável da página a partir da URL
   */
  private extractPageName(url: string): string {
    if (!url) return 'Página desconhecida';
    
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      
      // Remover barra inicial e final
      const cleanPath = path.replace(/^\/|\/$/, '');
      
      if (!cleanPath) return 'Página inicial';
      
      // Pegar último segmento e formatar
      const segments = cleanPath.split('/');
      const lastSegment = segments[segments.length - 1];
      
      // Remover extensões e converter para título
      const pageName = lastSegment
        .replace(/\.(html|php|aspx?)$/i, '')
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      return pageName || 'Página';
    } catch {
      return 'Página';
    }
  }

  /**
   * 🆕 ANALISAR DESCADASTRO - Detectar unsubscribe
   */
  private analyzeUnsubscribe(activities: MauticActivityEvent[], contact: MauticContact): LeadJourneyData['unsubscribe'] {
    // Procurar evento de descadastro
    const unsubscribeEvent = activities.find(a => 
      a.event === 'email.failed' && 
      (a.details as any)?.reason?.includes('unsubscribe')
    );

    const emailsSentBeforeUnsubscribe = unsubscribeEvent
      ? activities.filter(a => 
          a.event === 'email.sent' && 
          new Date(a.timestamp) < new Date(unsubscribeEvent.timestamp)
        ).length
      : null;

    return {
      isUnsubscribed: !!unsubscribeEvent || (contact as any).doNotContact === true,
      unsubscribeDate: unsubscribeEvent ? new Date(unsubscribeEvent.timestamp) : null,
      unsubscribeReason: (unsubscribeEvent?.details as any)?.reason || null,
      emailsBeforeUnsubscribe: emailsSentBeforeUnsubscribe,
    };
  }
}

export const leadJourneyService = new LeadJourneyService();
