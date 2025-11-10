import { invokeLLM } from '../_core/llm';
import { LeadJourneyData } from './leadJourneyService';

/**
 * Serviço de análise por IA da jornada de leads
 * Usa LLM para gerar insights e recomendações
 */
export class LeadJourneyAI {
  /**
   * Analisar jornada de um lead e gerar insights
   */
  async analyzeLeadJourney(journeyData: LeadJourneyData): Promise<string> {
    try {
      // Preparar dados para o LLM
      const prompt = this.buildAnalysisPrompt(journeyData);

      // Chamar LLM
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em análise de marketing e vendas. Sua função é analisar a jornada de leads e identificar padrões de comportamento que levam à conversão. Forneça insights acionáveis e recomendações específicas.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const analysis = response.choices[0].message.content;
      return analysis || 'Não foi possível gerar análise.';
    } catch (error: any) {
      console.error('[LeadJourneyAI] Error analyzing lead journey:', error.message);
      return 'Erro ao gerar análise por IA.';
    }
  }

  /**
   * Construir prompt para análise do LLM
   */
  private buildAnalysisPrompt(data: LeadJourneyData): string {
    const { mautic, pipedrive, metrics } = data;
    const contact = mautic.contact;

    // Informações básicas do lead
    const leadInfo = `
## Informações do Lead

- **Nome**: ${contact?.fields.all.firstname || 'N/A'} ${contact?.fields.all.lastname || ''}
- **E-mail**: ${contact?.fields.all.email || 'N/A'}
- **Pontos**: ${contact?.points || 0}
- **Data de Criação**: ${contact?.dateAdded ? new Date(contact.dateAdded).toLocaleDateString('pt-BR') : 'N/A'}
- **Última Atividade**: ${contact?.lastActive ? new Date(contact.lastActive).toLocaleDateString('pt-BR') : 'N/A'}
- **Dias na Base**: ${metrics.daysInBase}
`;

    // Status de conversão
    const conversionInfo = `
## Status de Conversão

- **Status**: ${this.getConversionStatusLabel(metrics.conversionStatus)}
- **Valor do Deal**: ${metrics.dealValue ? `R$ ${(metrics.dealValue / 100).toFixed(2)}` : 'N/A'}
- **Dias até Conversão**: ${metrics.daysToConversion !== null ? metrics.daysToConversion : 'N/A'}
`;

    // Métricas de engajamento
    const engagementInfo = `
## Métricas de Engajamento

- **Total de Atividades**: ${metrics.totalActivities}
- **E-mails Enviados**: ${metrics.emailsSent}
- **E-mails Abertos**: ${metrics.emailsOpened}
- **Taxa de Abertura**: ${metrics.emailsSent > 0 ? ((metrics.emailsOpened / metrics.emailsSent) * 100).toFixed(1) : 0}%
- **Páginas Visitadas**: ${metrics.pagesVisited}
- **Formulários Preenchidos**: ${metrics.formsSubmitted}
- **Downloads Realizados**: ${metrics.downloadsCompleted}
- **Vídeos Assistidos**: ${metrics.videosWatched}
- **Pontos Ganhos**: ${metrics.pointsGained}
`;

    // Campanhas e segmentos
    const campaignsInfo = `
## Campanhas e Segmentos

- **Campanhas Participadas**: ${mautic.campaigns.map(c => c.name).join(', ') || 'Nenhuma'}
- **Segmentos**: ${mautic.segments.map(s => s.name).join(', ') || 'Nenhum'}
`;

    // Atividades recentes (últimas 10)
    const recentActivities = mautic.activities.slice(0, 10);
    const activitiesInfo = `
## Atividades Recentes (Últimas 10)

${recentActivities.map((a, i) => `${i + 1}. **${a.eventType}** - ${new Date(a.timestamp).toLocaleDateString('pt-BR')}`).join('\n')}
`;

    // Prompt completo
    return `
Analise a jornada do seguinte lead e forneça insights detalhados:

${leadInfo}
${conversionInfo}
${engagementInfo}
${campaignsInfo}
${activitiesInfo}

**Tarefa**: Analise esses dados e forneça:

1. **Resumo do Comportamento**: Descreva o padrão de comportamento do lead (engajamento alto/médio/baixo, tipos de conteúdo consumidos, etc.)

2. **Pontos Fortes**: Identifique os aspectos positivos da jornada (alta taxa de abertura, muitos downloads, etc.)

3. **Pontos de Atenção**: Identifique possíveis problemas ou oportunidades perdidas

4. **Padrões Identificados**: ${metrics.conversionStatus === 'won' 
  ? 'Este lead CONVERTEU. Identifique os padrões que levaram à conversão (quais ações foram mais importantes, timing, etc.)'
  : 'Este lead NÃO converteu ainda. Identifique possíveis razões e o que pode ser feito para aumentar as chances de conversão'}

5. **Recomendações**: Forneça 3-5 recomendações acionáveis específicas para este lead ou para melhorar a estratégia com leads similares

Seja específico, use dados concretos e forneça insights acionáveis. Responda em português do Brasil, usando markdown para formatação.
`;
  }

  /**
   * Obter label do status de conversão
   */
  private getConversionStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      lead: '🔵 Lead (Não convertido)',
      negotiating: '🟡 Em Negociação',
      won: '🟢 Convertido (Ganho)',
      lost: '🔴 Perdido',
    };
    return labels[status] || status;
  }
}

export const leadJourneyAI = new LeadJourneyAI();
