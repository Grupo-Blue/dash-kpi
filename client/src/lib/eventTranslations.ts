/**
 * Helper para traduzir eventos técnicos do Mautic para linguagem amigável
 */

export interface EventTranslation {
  label: string;
  description: string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
}

const eventTranslations: Record<string, EventTranslation> = {
  // Eventos de E-mail
  'email.sent': {
    label: 'E-mail Enviado',
    description: 'Um e-mail foi enviado para o lead',
    icon: '📧',
    color: 'blue'
  },
  'email.read': {
    label: 'E-mail Aberto',
    description: 'O lead abriu um e-mail',
    icon: '📬',
    color: 'green'
  },
  'email.clicked': {
    label: 'Link Clicado',
    description: 'O lead clicou em um link no e-mail',
    icon: '🔗',
    color: 'green'
  },
  'email.failed': {
    label: 'Falha no Envio',
    description: 'O e-mail não pôde ser entregue',
    icon: '❌',
    color: 'red'
  },
  
  // Eventos de Campanha
  'campaign.event.scheduled': {
    label: 'E-mail Agendado',
    description: 'Um e-mail foi agendado para envio em uma campanha',
    icon: '📅',
    color: 'blue'
  },
  'campaign.event.triggered': {
    label: 'Campanha Acionada',
    description: 'Uma ação da campanha foi acionada',
    icon: '⚡',
    color: 'purple'
  },
  'lead.identified': {
    label: 'Lead Identificado',
    description: 'O lead foi identificado no sistema',
    icon: '👤',
    color: 'green'
  },
  
  // Eventos de Página
  'page.hit': {
    label: 'Página Visitada',
    description: 'O lead visitou uma página',
    icon: '🌐',
    color: 'blue'
  },
  'page.view': {
    label: 'Página Visualizada',
    description: 'O lead visualizou uma página',
    icon: '👁️',
    color: 'blue'
  },
  
  // Eventos de Formulário
  'form.submitted': {
    label: 'Formulário Enviado',
    description: 'O lead preencheu e enviou um formulário',
    icon: '📝',
    color: 'green'
  },
  'form.submit': {
    label: 'Formulário Enviado',
    description: 'O lead preencheu e enviou um formulário',
    icon: '📝',
    color: 'green'
  },
  
  // Eventos de Download
  'asset.download': {
    label: 'Material Baixado',
    description: 'O lead baixou um material',
    icon: '⬇️',
    color: 'green'
  },
  'download.completed': {
    label: 'Download Concluído',
    description: 'O lead completou o download de um arquivo',
    icon: '✅',
    color: 'green'
  },
  
  // Eventos de Vídeo
  'video.watched': {
    label: 'Vídeo Assistido',
    description: 'O lead assistiu a um vídeo',
    icon: '🎥',
    color: 'purple'
  },
  
  // Eventos de Pontos
  'point.gained': {
    label: 'Pontos Ganhos',
    description: 'O lead ganhou pontos de engajamento',
    icon: '⭐',
    color: 'yellow'
  },
  'lead.scorechange': {
    label: 'Pontuação Alterada',
    description: 'A pontuação do lead foi modificada',
    icon: '📊',
    color: 'yellow'
  },
  
  // Eventos de Segmento
  'lead.segment.add': {
    label: 'Adicionado ao Segmento',
    description: 'O lead foi adicionado a um segmento',
    icon: '🏷️',
    color: 'blue'
  },
  'lead.segment.remove': {
    label: 'Removido do Segmento',
    description: 'O lead foi removido de um segmento',
    icon: '🗑️',
    color: 'gray'
  },
  
  // Eventos de Descadastro
  'email.unsubscribed': {
    label: 'Descadastrado',
    description: 'O lead cancelou a inscrição de e-mails',
    icon: '🚫',
    color: 'red'
  },
  'lead.donotcontact': {
    label: 'Não Contactar',
    description: 'O lead solicitou não ser contatado',
    icon: '⛔',
    color: 'red'
  },
  
  // Eventos de Webhook
  'webhook.triggered': {
    label: 'Webhook Acionado',
    description: 'Um webhook foi acionado',
    icon: '🔔',
    color: 'purple'
  },
  
  // Eventos de Stage
  'lead.stage.change': {
    label: 'Estágio Alterado',
    description: 'O lead mudou de estágio no funil',
    icon: '🎯',
    color: 'blue'
  },
  
  // Eventos de Owner
  'lead.owner.change': {
    label: 'Responsável Alterado',
    description: 'O responsável pelo lead foi alterado',
    icon: '👥',
    color: 'blue'
  }
};

/**
 * Traduz um tipo de evento técnico para linguagem amigável
 */
export function translateEvent(eventType: string): EventTranslation {
  // Normalizar o tipo de evento (lowercase, remover espaços)
  const normalizedType = eventType.toLowerCase().trim();
  
  // Buscar tradução exata
  if (eventTranslations[normalizedType]) {
    return eventTranslations[normalizedType];
  }
  
  // Buscar por correspondência parcial
  const partialMatch = Object.keys(eventTranslations).find(key => 
    normalizedType.includes(key) || key.includes(normalizedType)
  );
  
  if (partialMatch) {
    return eventTranslations[partialMatch];
  }
  
  // Fallback: tentar gerar tradução genérica baseada no nome
  return generateGenericTranslation(eventType);
}

/**
 * Gera uma tradução genérica baseada no nome do evento
 */
function generateGenericTranslation(eventType: string): EventTranslation {
  const type = eventType.toLowerCase();
  
  // Email events
  if (type.includes('email')) {
    return {
      label: 'Evento de E-mail',
      description: `Ação relacionada a e-mail: ${eventType}`,
      icon: '📧',
      color: 'blue'
    };
  }
  
  // Campaign events
  if (type.includes('campaign')) {
    return {
      label: 'Evento de Campanha',
      description: `Ação de campanha: ${eventType}`,
      icon: '📢',
      color: 'purple'
    };
  }
  
  // Page events
  if (type.includes('page') || type.includes('visit') || type.includes('view')) {
    return {
      label: 'Visita à Página',
      description: `Visualização de página: ${eventType}`,
      icon: '🌐',
      color: 'blue'
    };
  }
  
  // Form events
  if (type.includes('form') || type.includes('submit')) {
    return {
      label: 'Formulário',
      description: `Interação com formulário: ${eventType}`,
      icon: '📝',
      color: 'green'
    };
  }
  
  // Download events
  if (type.includes('download') || type.includes('asset')) {
    return {
      label: 'Download',
      description: `Download de material: ${eventType}`,
      icon: '⬇️',
      color: 'green'
    };
  }
  
  // Lead events
  if (type.includes('lead')) {
    return {
      label: 'Evento do Lead',
      description: `Alteração no lead: ${eventType}`,
      icon: '👤',
      color: 'blue'
    };
  }
  
  // Default fallback
  return {
    label: formatEventName(eventType),
    description: `Evento: ${eventType}`,
    icon: '📌',
    color: 'gray'
  };
}

/**
 * Formata o nome do evento para exibição
 */
function formatEventName(eventType: string): string {
  return eventType
    .split('.')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Retorna a cor do badge baseada no tipo de evento
 */
export function getEventColor(eventType: string): string {
  const translation = translateEvent(eventType);
  
  const colorMap = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  
  return colorMap[translation.color] || colorMap.gray;
}

/**
 * Retorna descrições para tooltips de campos específicos
 */
export const fieldTooltips = {
  // Origem e Aquisição
  firstTouch: 'A primeira vez que o lead interagiu com seu conteúdo. Mostra como ele chegou até você.',
  lastTouch: 'A última atividade registrada do lead no sistema.',
  utmSource: 'Origem do tráfego (ex: google, facebook, newsletter)',
  utmMedium: 'Meio de marketing (ex: cpc, email, social)',
  utmCampaign: 'Nome da campanha de marketing',
  utmContent: 'Variação do anúncio ou conteúdo',
  utmTerm: 'Palavra-chave da campanha (geralmente para anúncios pagos)',
  landingPage: 'Primeira página que o lead visitou ao chegar no site',
  referrer: 'Site de onde o lead veio antes de acessar seu conteúdo',
  device: 'Tipo de dispositivo usado (desktop, mobile, tablet)',
  
  // Métricas
  emailsSent: 'Total de e-mails enviados para este lead',
  emailsOpened: 'Quantos e-mails o lead abriu (taxa de abertura)',
  pagesVisited: 'Número de páginas diferentes que o lead visitou',
  totalActivities: 'Soma de todas as interações do lead (e-mails, visitas, downloads, etc)',
  points: 'Pontuação de engajamento do lead. Quanto maior, mais engajado',
  daysInBase: 'Há quantos dias o lead está na base de contatos',
  
  // Status de Conversão
  conversionStatus: {
    lead: 'Lead ainda não converteu em cliente',
    negotiating: 'Lead está em negociação ativa no Pipedrive',
    won: 'Lead converteu e fechou negócio',
    lost: 'Negociação foi perdida'
  },
  
  // Comportamento
  engagementScore: 'Pontuação de 0 a 100 que indica o nível de engajamento do lead',
  visitFrequency: {
    daily: 'Lead acessa o conteúdo diariamente - muito engajado!',
    weekly: 'Lead acessa semanalmente - engajamento moderado',
    sporadic: 'Lead acessa esporadicamente - baixo engajamento',
    inactive: 'Lead não tem acessado recentemente - considere reengajamento'
  }
};
