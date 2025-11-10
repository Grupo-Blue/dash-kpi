import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, Mail, Calendar, TrendingUp, Activity, Target, Users, FileText } from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

export default function LeadAnalysis() {
  const [email, setEmail] = useState("");
  const [searchEmail, setSearchEmail] = useState<string | null>(null);

  // Query para buscar jornada do lead
  const { data: journey, isLoading, error } = trpc.leadJourney.search.useQuery(
    { email: searchEmail!, useCache: true },
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

  const handleGenerateAI = async () => {
    if (!searchEmail) return;
    const result = await generateAI.mutateAsync({ email: searchEmail });
    setAiAnalysis(result.analysis);
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
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="conversion">Conversão</TabsTrigger>
            <TabsTrigger value="ai-analysis">Análise IA</TabsTrigger>
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
                <div>
                  <p className="text-sm text-muted-foreground">Pontos</p>
                  <p className="font-medium">{journey.mautic.contact?.points || 0}</p>
                </div>
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
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    E-mails
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
                    journey.mautic.activities.map((activity, index) => (
                      <div key={index} className="flex gap-4 border-l-2 border-muted pl-4 pb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary">{activity.eventType}</Badge>
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
                    ))
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
                            R$ {(journey.metrics.dealValue / 100).toFixed(2)}
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
                            <li key={deal.id} className="flex items-center justify-between p-2 bg-muted rounded">
                              <span>{deal.title}</span>
                              <Badge
                                variant={
                                  deal.status === "won" ? "default" : deal.status === "lost" ? "destructive" : "secondary"
                                }
                              >
                                {deal.status}
                              </Badge>
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
                  <TrendingUp className="h-5 w-5" />
                  Análise por Inteligência Artificial
                </CardTitle>
                <CardDescription>Insights e recomendações gerados automaticamente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!aiAnalysis && (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <p className="text-muted-foreground text-center">
                      Clique no botão abaixo para gerar uma análise detalhada por IA sobre este lead
                    </p>
                    <Button onClick={handleGenerateAI} disabled={generateAI.isPending}>
                      {generateAI.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Gerando análise...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Gerar Análise por IA
                        </>
                      )}
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
  );
}
