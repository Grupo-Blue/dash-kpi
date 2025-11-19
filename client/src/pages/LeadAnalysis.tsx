import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, Mail, Calendar, TrendingUp, Activity, Target, Users, FileText, RefreshCw, Clock, ExternalLink, HelpCircle, Sparkles } from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import TimelineVisual from "@/components/TimelineVisual";
import AcquisitionAnalysis from "@/components/AcquisitionAnalysis";
import DashboardLayout from "@/components/DashboardLayout";
import EmailHistoryList from "@/components/EmailHistoryList";
import { translateEvent, fieldTooltips } from "@/lib/eventTranslations";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function LeadAnalysis() {
  const [email, setEmail] = useState("");
  const [searchEmail, setSearchEmail] = useState<string | null>(null);
  const [useCache, setUseCache] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Debug: log quando a aba mudar
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
  }, [activeTab]);

  // Query para buscar jornada do lead
  const { data: journey, isLoading, error, refetch } = trpc.leadJourney.search.useQuery(
    { email: searchEmail!, useCache },
    { enabled: !!searchEmail }
  );

  // Query para buscar histórico
  const { data: history } = trpc.leadJourney.getHistory.useQuery({ limit: 50 });

  // Mutation para gerar análise por IA
  const generateAI = trpc.leadJourney.generateAIAnalysis.useMutation({
    onSuccess: () => {
      toast.success("Análise por IA gerada com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao gerar análise: ${error.message}`);
    },
  });

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [autoGenerateAI, setAutoGenerateAI] = useState(true);

  // Auto-gerar análise por IA quando journey carregar
  useEffect(() => {
    if (journey && autoGenerateAI && !aiAnalysis && !generateAI.isPending) {
      handleGenerateAI();
    }
  }, [journey, autoGenerateAI]);

  const handleGenerateAI = async () => {
    if (!searchEmail) return;
    try {
      const result = await generateAI.mutateAsync({ email: searchEmail });
      setAiAnalysis(result.analysis);
    } catch (error) {
      console.error('Erro ao gerar análise IA:', error);
      // Não mostrar toast de erro aqui pois já é tratado no mutation
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Digite um e-mail válido");
      return;
    }
    setSearchEmail(email.trim());
  };

  const handleHistoryClick = (historyEmail: string) => {
    setEmail(historyEmail);
    setSearchEmail(historyEmail);
  };

  return (
    <DashboardLayout>
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Análise de Jornada de Leads</h1>
        <p className="text-muted-foreground mt-2">
          Busque um lead por e-mail para visualizar sua jornada completa no Mautic e Pipedrive
        </p>
      </div>

      {/* Formulário de busca */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Lead</CardTitle>
          <CardDescription>Digite o e-mail do lead para visualizar sua jornada</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Resultado da busca */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-4 text-muted-foreground">Buscando dados do lead...</span>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-6">
            <p className="text-destructive">Erro ao buscar lead: {error.message}</p>
          </CardContent>
        </Card>
      )}

      {journey === null && searchEmail && !isLoading && (
        <Card>
          <CardContent className="py-6">
            <p className="text-muted-foreground">
              Lead não encontrado no Mautic. Verifique se o e-mail está correto.
            </p>
          </CardContent>
        </Card>
      )}

      {journey && (
        <>
          {/* Timestamp e botão de atualização */}
          <Card className="bg-muted/50">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Última atualização: {new Date(journey.lastUpdated).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  setUseCache(false);
                  toast.info("Buscando dados atualizados...");
                  await refetch();
                  setUseCache(true);
                  toast.success("Dados atualizados!");
                }}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar Dados
              </Button>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={(value) => {
            console.log('Tab change requested:', value);
            setActiveTab(value);
          }} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" onClick={() => {
              console.log('TabsTrigger onClick: overview');
              setActiveTab('overview');
            }}>Visão Geral</TabsTrigger>
            <TabsTrigger value="advanced" onClick={() => {
              console.log('TabsTrigger onClick: advanced');
              setActiveTab('advanced');
            }}>Análise Avançada</TabsTrigger>
            <TabsTrigger value="timeline" onClick={() => {
              console.log('TabsTrigger onClick: timeline');
              setActiveTab('timeline');
            }}>Timeline</TabsTrigger>
            <TabsTrigger value="conversion" onClick={() => {
              console.log('TabsTrigger onClick: conversion');
              setActiveTab('conversion');
            }}>Conversão</TabsTrigger>
            <TabsTrigger value="ai-analysis" onClick={() => {
              console.log('TabsTrigger onClick: ai-analysis');
              setActiveTab('ai-analysis');
            }}>Análise IA</TabsTrigger>
          </TabsList>

          {/* Aba: Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {/* Informações básicas do lead */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Informações do Lead
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">
                    {journey.mautic.contact?.fields.all.firstname || "N/A"}{" "}
                    {journey.mautic.contact?.fields.all.lastname || ""}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">E-mail</p>
                  <p className="font-medium">{journey.mautic.contact?.fields.all.email || "N/A"}</p>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          Pontos
                          <HelpCircle className="h-3 w-3" />
                        </p>
                        <p className="font-medium">{journey.mautic.contact?.points || 0}</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{fieldTooltips.points}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={
                      journey.metrics.conversionStatus === "won"
                        ? "default"
                        : journey.metrics.conversionStatus === "negotiating"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {journey.metrics.conversionStatus === "won"
                      ? "🟢 Convertido"
                      : journey.metrics.conversionStatus === "negotiating"
                      ? "🟡 Em Negociação"
                      : journey.metrics.conversionStatus === "lost"
                      ? "🔴 Perdido"
                      : "🔵 Lead"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Métricas de engajamento */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="cursor-help">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          E-mails
                          <HelpCircle className="h-3 w-3 text-muted-foreground" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{journey.metrics.emailsOpened}</div>
                        <p className="text-xs text-muted-foreground">
                          de {journey.metrics.emailsSent} enviados (
                          {journey.metrics.emailsSent > 0
                            ? ((journey.metrics.emailsOpened / journey.metrics.emailsSent) * 100).toFixed(1)
                            : 0}
                          %)
                        </p>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{fieldTooltips.emailsOpened}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Páginas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{journey.metrics.pagesVisited}</div>
                  <p className="text-xs text-muted-foreground">visitadas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Atividades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{journey.metrics.totalActivities}</div>
                  <p className="text-xs text-muted-foreground">total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Tempo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{journey.metrics.daysInBase}</div>
                  <p className="text-xs text-muted-foreground">dias na base</p>
                </CardContent>
              </Card>
            </div>

            {/* Campanhas e Segmentos */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Campanhas</CardTitle>
                </CardHeader>
                <CardContent>
                  {journey.mautic.campaigns.length > 0 ? (
                    <ul className="space-y-2">
                      {journey.mautic.campaigns.map((campaign) => (
                        <li key={campaign.id} className="flex items-center gap-2">
                          <Badge variant="outline">{campaign.name}</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma campanha</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Segmentos</CardTitle>
                </CardHeader>
                <CardContent>
                  {journey.mautic.segments.length > 0 ? (
                    <ul className="space-y-2">
                      {journey.mautic.segments.map((segment) => (
                        <li key={segment.id} className="flex items-center gap-2">
                          <Badge variant="outline">{segment.name}</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum segmento</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba: Análise Avançada */}
          <TabsContent value="advanced" className="space-y-6">
            {/* Histórico de E-mails */}
            <EmailHistoryList 
              activities={journey.mautic.activities}
              emailsSent={journey.metrics.emailsSent}
              emailsOpened={journey.metrics.emailsOpened}
            />

            {/* Origem e Aquisição */}
            {journey.acquisition && (
              <div>
                <h3 className="text-lg font-semibold mb-4">🎯 Origem e Aquisição</h3>
                <AcquisitionAnalysis data={journey.acquisition} />
              </div>
            )}

            {/* Timeline Visual */}
            {journey.timeline && (
              <div>
                <h3 className="text-lg font-semibold mb-4">📈 Timeline da Jornada</h3>
                <TimelineVisual 
                  events={journey.timeline.events}
                  activityPeaks={journey.timeline.activityPeaks}
                  inactivePeriods={journey.timeline.inactivePeriods}
                />
              </div>
            )}

            {/* Padrões de Comportamento */}
            {journey.behavior && (
              <div className="grid gap-4 md:grid-cols-2">
                {/* Engagement Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5" />
                      Engagement Score
                    </CardTitle>
                    <CardDescription>Nível de engajamento do lead</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary">
                        {journey.behavior.engagementScore}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">de 100 pontos</p>
                      <div className="mt-4 w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${journey.behavior.engagementScore}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Frequência de Visitas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Activity className="h-5 w-5" />
                      Frequência de Visitas
                    </CardTitle>
                    <CardDescription>Padrão de acesso do lead</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <Badge 
                        variant={journey.behavior.visitFrequency === 'daily' ? 'default' : 'secondary'}
                        className="text-lg px-4 py-2"
                      >
                        {journey.behavior.visitFrequency === 'daily' && '🔥 Diário'}
                        {journey.behavior.visitFrequency === 'weekly' && '📅 Semanal'}
                        {journey.behavior.visitFrequency === 'sporadic' && '⏱️ Esporádico'}
                        {journey.behavior.visitFrequency === 'inactive' && '💤 Inativo'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Páginas */}
                {journey.behavior.topPages.length > 0 && (
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Páginas Mais Visitadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {journey.behavior.topPages.map((page, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                            <a 
                              href={page.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex-1 truncate"
                            >
                              {page.url}
                            </a>
                            <Badge variant="secondary">{page.visits} visitas</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Top Conteúdos */}
                {journey.behavior.topContent.length > 0 && (
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Conteúdos Mais Consumidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {journey.behavior.topContent.map((content, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{content.title}</p>
                              <p className="text-xs text-muted-foreground">{content.type}</p>
                            </div>
                            <Badge variant="secondary">{content.views} views</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Descadastro */}
            {journey.unsubscribe?.isUnsubscribed && (
              <Card className="border-yellow-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-yellow-600">
                    ⚠️ Lead Descadastrado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {journey.unsubscribe.unsubscribeDate && (
                      <p className="text-sm">
                        <strong>Data:</strong> {new Date(journey.unsubscribe.unsubscribeDate).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    {journey.unsubscribe.emailsBeforeUnsubscribe !== null && (
                      <p className="text-sm">
                        <strong>E-mails recebidos antes do descadastro:</strong> {journey.unsubscribe.emailsBeforeUnsubscribe}
                      </p>
                    )}
                    {journey.unsubscribe.unsubscribeReason && (
                      <p className="text-sm">
                        <strong>Motivo:</strong> {journey.unsubscribe.unsubscribeReason}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba: Timeline */}
          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Timeline de Atividades</CardTitle>
                <CardDescription>
                  Histórico completo de interações do lead ({journey.mautic.activities.length} atividades)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {journey.mautic.activities.length > 0 ? (
                    journey.mautic.activities.map((activity, index) => {
                      const translation = translateEvent(activity.eventType);
                      return (
                        <div key={index} className="flex gap-4 border-l-2 border-muted pl-4 pb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="secondary" className="cursor-help">
                                      {translation.icon} {translation.label}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">{translation.description}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Técnico: {activity.eventType}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <span className="text-xs text-muted-foreground">
                                {new Date(activity.timestamp).toLocaleString("pt-BR")}
                              </span>
                            </div>
                            {activity.details && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {JSON.stringify(activity.details)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-muted-foreground">Nenhuma atividade registrada</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Conversão */}
          <TabsContent value="conversion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Dados de Conversão (Pipedrive)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {journey.pipedrive.person ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Nome no Pipedrive</p>
                        <p className="font-medium">{journey.pipedrive.person.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total de Deals</p>
                        <p className="font-medium">{journey.pipedrive.deals.length}</p>
                      </div>
                      {journey.metrics.dealValue && (
                        <div>
                          <p className="text-sm text-muted-foreground">Valor do Deal</p>
                          <p className="font-medium text-green-600">
                            R$ {journey.metrics.dealValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      )}
                    </div>

                    {journey.metrics.daysToConversion && (
                      <div>
                        <p className="text-sm text-muted-foreground">Tempo até conversão</p>
                        <p className="font-medium">{journey.metrics.daysToConversion} dias</p>
                      </div>
                    )}

                    {journey.pipedrive.deals.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Deals:</p>
                        <ul className="space-y-2">
                          {journey.pipedrive.deals.map((deal: any) => (
                            <li key={deal.id} className="p-3 bg-muted rounded space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <a
                                    href={`https://app.pipedrive.com/deal/${deal.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium hover:underline flex items-center gap-1 text-primary"
                                  >
                                    {deal.title}
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                  {deal.add_time && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Aberto em: {new Date(deal.add_time).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                      })}
                                    </p>
                                  )}
                                </div>
                                <Badge
                                  variant={
                                    deal.status === "won" ? "default" : deal.status === "lost" ? "destructive" : "secondary"
                                  }
                                >
                                  {deal.status}
                                </Badge>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">Lead não encontrado no Pipedrive</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Análise IA */}
          <TabsContent value="ai-analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Análise por Inteligência Artificial
                </CardTitle>
                <CardDescription>
                  Insights e recomendações gerados automaticamente ao carregar os dados do lead
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {generateAI.isPending && !aiAnalysis && (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                    <div className="text-center space-y-2">
                      <p className="font-medium">Gerando análise inteligente...</p>
                      <p className="text-sm text-muted-foreground">
                        Analisando jornada do lead, padrões de comportamento e oportunidades
                      </p>
                    </div>
                  </div>
                )}
                
                {!aiAnalysis && !generateAI.isPending && (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <p className="text-muted-foreground text-center">
                      A análise por IA é gerada automaticamente. Clique abaixo se precisar regenerar.
                    </p>
                    <Button onClick={handleGenerateAI} disabled={generateAI.isPending}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Gerar Análise por IA
                    </Button>
                  </div>
                )}

                {aiAnalysis && (
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" onClick={handleGenerateAI} disabled={generateAI.isPending}>
                        {generateAI.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Regenerando...
                          </>
                        ) : (
                          "Regenerar Análise"
                        )}
                      </Button>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <Streamdown>{aiAnalysis}</Streamdown>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </>
      )}

      {/* Histórico de pesquisas */}
      {history && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Pesquisas</CardTitle>
            <CardDescription>Últimas {history.length} pesquisas realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleHistoryClick(item.email)}
                  className="w-full flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors text-left"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.leadName || item.email}</p>
                    <p className="text-sm text-muted-foreground">{item.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        item.conversionStatus === "won"
                          ? "default"
                          : item.conversionStatus === "negotiating"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {item.conversionStatus === "won"
                        ? "Convertido"
                        : item.conversionStatus === "negotiating"
                        ? "Negociando"
                        : item.conversionStatus === "lost"
                        ? "Perdido"
                        : "Lead"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.searchedAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </DashboardLayout>
  );
}
