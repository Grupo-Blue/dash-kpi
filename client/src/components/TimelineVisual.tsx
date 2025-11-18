import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  MousePointerClick, 
  FileText, 
  Download, 
  Video, 
  TrendingUp, 
  Users, 
  Tag,
  Eye,
  ExternalLink,
  Filter
} from "lucide-react";

interface TimelineEvent {
  id: string;
  date: Date;
  type: 'email_sent' | 'email_opened' | 'email_clicked' | 'page_visit' | 'form_submit' | 'download' | 'video_watch' | 'point_gained' | 'campaign_join' | 'segment_join' | 'unsubscribe';
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

interface TimelineVisualProps {
  events: TimelineEvent[];
  activityPeaks?: { date: string; count: number }[];
  inactivePeriods?: { start: Date; end: Date; days: number }[];
}

const EVENT_ICONS: Record<TimelineEvent['type'], any> = {
  email_sent: Mail,
  email_opened: Eye,
  email_clicked: MousePointerClick,
  page_visit: ExternalLink,
  form_submit: FileText,
  download: Download,
  video_watch: Video,
  point_gained: TrendingUp,
  campaign_join: Tag,
  segment_join: Users,
  unsubscribe: Mail,
};

const EVENT_COLORS: Record<TimelineEvent['type'], string> = {
  email_sent: 'bg-blue-500',
  email_opened: 'bg-green-500',
  email_clicked: 'bg-purple-500',
  page_visit: 'bg-cyan-500',
  form_submit: 'bg-orange-500',
  download: 'bg-pink-500',
  video_watch: 'bg-red-500',
  point_gained: 'bg-yellow-500',
  campaign_join: 'bg-indigo-500',
  segment_join: 'bg-teal-500',
  unsubscribe: 'bg-gray-500',
};

const EVENT_LABELS: Record<TimelineEvent['type'], string> = {
  email_sent: 'E-mail',
  email_opened: 'Abertura',
  email_clicked: 'Clique',
  page_visit: 'Página',
  form_submit: 'Formulário',
  download: 'Download',
  video_watch: 'Vídeo',
  point_gained: 'Pontos',
  campaign_join: 'Campanha',
  segment_join: 'Segmento',
  unsubscribe: 'Descadastro',
};

export default function TimelineVisual({ events, activityPeaks = [], inactivePeriods = [] }: TimelineVisualProps) {
  const [selectedTypes, setSelectedTypes] = useState<Set<TimelineEvent['type']>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar eventos
  const filteredEvents = selectedTypes.size === 0 
    ? events 
    : events.filter(e => selectedTypes.has(e.type));

  // Contar eventos por tipo
  const eventCounts: Record<string, number> = {};
  events.forEach(e => {
    eventCounts[e.type] = (eventCounts[e.type] || 0) + 1;
  });

  const toggleType = (type: TimelineEvent['type']) => {
    const newSelected = new Set(selectedTypes);
    if (newSelected.has(type)) {
      newSelected.delete(type);
    } else {
      newSelected.add(type);
    }
    setSelectedTypes(newSelected);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Timeline da Jornada
            </CardTitle>
            <CardDescription>
              {filteredEvents.length} eventos • {activityPeaks.length} picos de atividade
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(EVENT_LABELS).map(([type, label]) => {
              const count = eventCounts[type] || 0;
              if (count === 0) return null;

              const isSelected = selectedTypes.has(type as TimelineEvent['type']);
              const Icon = EVENT_ICONS[type as TimelineEvent['type']];

              return (
                <Button
                  key={type}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleType(type as TimelineEvent['type'])}
                  className="gap-2"
                >
                  <Icon className="h-3 w-3" />
                  {label} ({count})
                </Button>
              );
            })}
            {selectedTypes.size > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTypes(new Set())}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Períodos de inatividade */}
        {inactivePeriods.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h4 className="font-medium text-sm mb-2">⚠️ Períodos de Inatividade</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              {inactivePeriods.map((period, i) => (
                <div key={i}>
                  {period.days} dias sem atividade ({new Date(period.start).toLocaleDateString('pt-BR')} - {new Date(period.end).toLocaleDateString('pt-BR')})
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="relative">
          {/* Linha vertical */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          {/* Eventos */}
          <div className="space-y-6">
            {filteredEvents.map((event, index) => {
              const Icon = EVENT_ICONS[event.type];
              const color = EVENT_COLORS[event.type];

              return (
                <div key={event.id} className="relative flex gap-4">
                  {/* Ícone */}
                  <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full ${color} text-white shadow-lg`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {EVENT_LABELS[event.type]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.date).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <h4 className="font-medium">{event.title}</h4>
                        {event.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {/* Se a descrição é uma URL, tornar clicável */}
                            {event.description.startsWith('http') ? (
                              <a 
                                href={event.description} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1 line-clamp-2"
                              >
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                {event.description}
                              </a>
                            ) : (
                              <p className="line-clamp-2">{event.description}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum evento encontrado com os filtros selecionados
            </div>
          )}
        </div>

        {/* Picos de atividade */}
        {activityPeaks.length > 0 && (
          <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-medium text-sm mb-3">📈 Dias Mais Ativos</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {activityPeaks.slice(0, 5).map((peak, i) => (
                <div key={i} className="text-center p-2 bg-background rounded border">
                  <div className="text-2xl font-bold text-green-600">{peak.count}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(peak.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
