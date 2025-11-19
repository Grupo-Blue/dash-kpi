import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MailOpen, MousePointerClick, Calendar, ExternalLink } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EmailEvent {
  id: string;
  subject?: string;
  campaignName?: string;
  sentDate: Date;
  openedDate?: Date | null;
  clickedDate?: Date | null;
  status: 'sent' | 'opened' | 'clicked' | 'bounced';
  links?: string[];
}

interface EmailHistoryListProps {
  activities: any[]; // Atividades do Mautic
  emailsSent: number;
  emailsOpened: number;
}

export default function EmailHistoryList({ activities, emailsSent, emailsOpened }: EmailHistoryListProps) {
  // Processar atividades para extrair eventos de e-mail
  const emailEvents = processEmailActivities(activities);
  
  // Calcular estatísticas
  const openRate = emailsSent > 0 ? ((emailsOpened / emailsSent) * 100).toFixed(1) : '0';
  const clickedEmails = emailEvents.filter(e => e.status === 'clicked').length;
  const clickRate = emailsSent > 0 ? ((clickedEmails / emailsSent) * 100).toFixed(1) : '0';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Histórico de E-mails
        </CardTitle>
        <CardDescription>
          {emailsSent} e-mails enviados • {emailsOpened} abertos ({openRate}%) • {clickedEmails} clicados ({clickRate}%)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {emailEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum e-mail enviado para este lead</p>
          </div>
        ) : (
          <div className="space-y-3">
            {emailEvents.map((email, index) => (
              <EmailEventCard key={email.id || index} email={email} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmailEventCard({ email }: { email: EmailEvent }) {
  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Informações do e-mail */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            {/* Ícone de status */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  {email.status === 'clicked' && (
                    <MousePointerClick className="h-4 w-4 text-green-600" />
                  )}
                  {email.status === 'opened' && (
                    <MailOpen className="h-4 w-4 text-blue-600" />
                  )}
                  {email.status === 'sent' && (
                    <Mail className="h-4 w-4 text-gray-600" />
                  )}
                  {email.status === 'bounced' && (
                    <Mail className="h-4 w-4 text-red-600" />
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  {email.status === 'clicked' && 'Lead clicou em link do e-mail'}
                  {email.status === 'opened' && 'Lead abriu o e-mail'}
                  {email.status === 'sent' && 'E-mail enviado (não aberto)'}
                  {email.status === 'bounced' && 'E-mail retornou (bounce)'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Assunto/Nome da campanha */}
            <h4 className="font-medium text-sm">
              {email.subject || email.campaignName || 'E-mail sem assunto'}
            </h4>
          </div>
          
          {/* Campanha (se houver) */}
          {email.campaignName && email.subject && (
            <p className="text-xs text-muted-foreground">
              Campanha: {email.campaignName}
            </p>
          )}
          
          {/* Timeline de eventos */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Enviado: {formatDate(email.sentDate)}</span>
            </div>
            
            {email.openedDate && (
              <div className="flex items-center gap-1">
                <MailOpen className="h-3 w-3 text-blue-600" />
                <span className="text-blue-600">
                  Aberto: {formatDate(email.openedDate)}
                </span>
              </div>
            )}
            
            {email.clickedDate && (
              <div className="flex items-center gap-1">
                <MousePointerClick className="h-3 w-3 text-green-600" />
                <span className="text-green-600">
                  Clicado: {formatDate(email.clickedDate)}
                </span>
              </div>
            )}
          </div>
          
          {/* Links clicados */}
          {email.links && email.links.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Links clicados:</p>
              {email.links.map((link, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1 truncate"
                >
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{link}</span>
                </a>
              ))}
            </div>
          )}
        </div>
        
        {/* Badge de status */}
        <Badge
          variant={
            email.status === 'clicked' ? 'default' :
            email.status === 'opened' ? 'secondary' :
            email.status === 'bounced' ? 'destructive' :
            'outline'
          }
          className="flex-shrink-0"
        >
          {email.status === 'clicked' && '✅ Clicado'}
          {email.status === 'opened' && '📬 Aberto'}
          {email.status === 'sent' && '📧 Enviado'}
          {email.status === 'bounced' && '❌ Bounce'}
        </Badge>
      </div>
    </div>
  );
}

/**
 * Processa atividades do Mautic para extrair eventos de e-mail
 */
function processEmailActivities(activities: any[]): EmailEvent[] {
  const emailMap = new Map<string, EmailEvent>();
  
  activities.forEach(activity => {
    const eventType = activity.eventType?.toLowerCase() || '';
    
    // Identificar e-mails enviados
    if (eventType.includes('email') && eventType.includes('sent')) {
      const emailId = activity.metadata?.email_id || activity.id;
      const subject = activity.metadata?.subject || activity.metadata?.email_name;
      const campaignName = activity.metadata?.campaign_name;
      
      emailMap.set(emailId, {
        id: emailId,
        subject,
        campaignName,
        sentDate: new Date(activity.timestamp),
        status: 'sent'
      });
    }
    
    // Identificar e-mails abertos
    if (eventType.includes('email') && (eventType.includes('read') || eventType.includes('open'))) {
      const emailId = activity.metadata?.email_id || activity.id;
      const existing = emailMap.get(emailId);
      
      if (existing) {
        existing.openedDate = new Date(activity.timestamp);
        existing.status = 'opened';
      } else {
        // E-mail aberto sem registro de envio
        emailMap.set(emailId, {
          id: emailId,
          subject: activity.metadata?.subject || activity.metadata?.email_name,
          campaignName: activity.metadata?.campaign_name,
          sentDate: new Date(activity.timestamp),
          openedDate: new Date(activity.timestamp),
          status: 'opened'
        });
      }
    }
    
    // Identificar cliques em links
    if (eventType.includes('email') && eventType.includes('click')) {
      const emailId = activity.metadata?.email_id || activity.id;
      const existing = emailMap.get(emailId);
      const link = activity.metadata?.url || activity.metadata?.link;
      
      if (existing) {
        existing.clickedDate = new Date(activity.timestamp);
        existing.status = 'clicked';
        if (link) {
          existing.links = existing.links || [];
          if (!existing.links.includes(link)) {
            existing.links.push(link);
          }
        }
      } else {
        // Clique sem registro de envio/abertura
        emailMap.set(emailId, {
          id: emailId,
          subject: activity.metadata?.subject || activity.metadata?.email_name,
          campaignName: activity.metadata?.campaign_name,
          sentDate: new Date(activity.timestamp),
          clickedDate: new Date(activity.timestamp),
          status: 'clicked',
          links: link ? [link] : []
        });
      }
    }
    
    // Identificar bounces
    if (eventType.includes('email') && (eventType.includes('bounce') || eventType.includes('fail'))) {
      const emailId = activity.metadata?.email_id || activity.id;
      const existing = emailMap.get(emailId);
      
      if (existing) {
        existing.status = 'bounced';
      } else {
        emailMap.set(emailId, {
          id: emailId,
          subject: activity.metadata?.subject || activity.metadata?.email_name,
          campaignName: activity.metadata?.campaign_name,
          sentDate: new Date(activity.timestamp),
          status: 'bounced'
        });
      }
    }
  });
  
  // Converter para array e ordenar por data (mais recente primeiro)
  return Array.from(emailMap.values())
    .sort((a, b) => b.sentDate.getTime() - a.sentDate.getTime());
}

/**
 * Formata data para exibição
 */
function formatDate(date: Date): string {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}
