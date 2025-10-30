import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { RefreshCw, Users, MessageSquare, TrendingUp, Hash, Heart, MessageCircle, Share2, Eye, BarChart3, ExternalLink, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { KpiCardWithTooltip } from "@/components/KpiCardWithTooltip";
import { getKpiDescription } from "@/lib/kpiDescriptions";
import { SocialMediaTabs } from "@/components/SocialMediaTabs";

export default function TokenizaAcademy() {
  const { data: kpis, isLoading, refetch } = trpc.kpis.tokenizaAcademy.useQuery();
  const { data: socialKpis, isLoading: socialLoading } = trpc.kpis.metricoolSocialMedia.useQuery({
    blogId: '3893327', // Tokeniza Academy
  });
  
  const refreshMutation = trpc.kpis.refresh.useMutation({
    onSuccess: () => {
      toast.success("KPIs atualizados com sucesso!");
      refetch();
    },
    onError: () => {
      toast.error("Erro ao atualizar KPIs");
    },
  });

  const handleRefresh = () => {
    refreshMutation.mutate({ companySlug: "tokeniza-academy" });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Discord Tab
  const discordTab = (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas da Comunidade</CardTitle>
            <CardDescription>Métricas adicionais do Discord</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Taxa de Atividade</span>
                <span className="font-semibold">{kpis?.additionalMetrics?.activityRate?.value || '0%'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total de Canais</span>
                <span className="font-semibold">{kpis?.additionalMetrics?.totalChannels?.value || '0'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Humanos</span>
                <span className="font-semibold">{kpis?.additionalMetrics?.memberDistribution?.humans?.toLocaleString('pt-BR') || '0'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Bots</span>
                <span className="font-semibold">{kpis?.additionalMetrics?.memberDistribution?.bots?.toLocaleString('pt-BR') || '0'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Canais Mais Ativos</CardTitle>
            <CardDescription>Top 3 canais por mensagens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">1</div>
                  <div>
                    <p className="font-medium"># geral</p>
                    <p className="text-xs text-muted-foreground">1,234 mensagens</p>
                  </div>
                </div>
                <Hash className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">2</div>
                  <div>
                    <p className="font-medium"># trading</p>
                    <p className="text-xs text-muted-foreground">987 mensagens</p>
                  </div>
                </div>
                <Hash className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">3</div>
                  <div>
                    <p className="font-medium"># análises</p>
                    <p className="text-xs text-muted-foreground">765 mensagens</p>
                  </div>
                </div>
                <Hash className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Cursos Tab
  const cursosTab = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plataforma de Cursos</CardTitle>
          <CardDescription>Métricas da Tokeniza Academy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="text-sm">Alunos Ativos</span>
              </div>
              <div className="text-3xl font-bold">456</div>
              <p className="text-xs text-muted-foreground">
                Alunos com acesso ativo aos cursos
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Cursos Vendidos (Mês)</span>
              </div>
              <div className="text-3xl font-bold">34</div>
              <p className="text-xs text-muted-foreground">
                Novos cursos vendidos este mês
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Taxa de Conclusão</span>
              </div>
              <div className="text-3xl font-bold">68%</div>
              <p className="text-xs text-muted-foreground">
                Alunos que completam os cursos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status das Integrações</CardTitle>
          <CardDescription>Configure as APIs para dados em tempo real</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Discord API</p>
              <p className="text-sm text-muted-foreground">Configure o bot do Discord para métricas da comunidade</p>
            </div>
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Pendente</span>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Tokeniza Academy API</p>
              <p className="text-sm text-muted-foreground">Dados de cursos e alunos</p>
            </div>
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Pendente</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Redes Sociais Tab
  const redesSociaisTab = socialKpis ? (
    <div className="space-y-6">
      {/* Social Media KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KpiCardWithTooltip
          kpi={{
            value: socialKpis?.totalPosts || 0,
            label: "Total de Posts",
          }}
          description={getKpiDescription('totalPosts')}
        />

        <KpiCardWithTooltip
          kpi={{
            value: formatNumber(socialKpis?.totalInteractions || 0),
            label: "Interações",
          }}
          description={getKpiDescription('totalInteractions')}
        />

        <KpiCardWithTooltip
          kpi={{
            value: `${(socialKpis?.averageEngagement || 0).toFixed(2)}%`,
            label: "Engagement Médio",
          }}
          description={getKpiDescription('averageEngagement')}
        />

        <KpiCardWithTooltip
          kpi={{
            value: formatNumber(socialKpis?.totalReach || 0),
            label: "Alcance Total",
          }}
          description={getKpiDescription('totalReach')}
        />

        <KpiCardWithTooltip
          kpi={{
            value: formatNumber(socialKpis?.totalImpressions || 0),
            label: "Impressões",
          }}
          description={getKpiDescription('totalImpressions')}
        />
      </div>

      {/* Top Posts */}
      {socialKpis?.topPosts && socialKpis.topPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Posts por Engagement</CardTitle>
            <CardDescription>Posts com melhor performance nos últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {socialKpis.topPosts.map((post: any, index: number) => (
                <a 
                  key={index} 
                  href={post.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-muted-foreground truncate flex-1">{post.content}</p>
                      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {post.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-3 h-3" />
                        {post.shares}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-lg font-bold text-primary">{post.engagement.toFixed(2)}%</div>
                    <div className="text-xs text-muted-foreground">engagement</div>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  ) : (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Nenhum dado de redes sociais disponível</p>
        </div>
      </CardContent>
    </Card>
  );

  const tabs = [
    {
      id: 'discord',
      label: 'Discord',
      icon: <MessageSquare className="h-4 w-4" />,
      content: discordTab,
    },
    {
      id: 'cursos',
      label: 'Cursos',
      icon: <GraduationCap className="h-4 w-4" />,
      content: cursosTab,
    },
    {
      id: 'redes-sociais',
      label: 'Redes Sociais',
      icon: <TrendingUp className="h-4 w-4" />,
      content: redesSociaisTab,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tokeniza Academy</h1>
            <p className="text-muted-foreground mt-2">
              Tokeniza Academy - KPIs de cursos e comunidade Discord
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshMutation.isPending}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
            Atualizar Dados
          </Button>
        </div>

        {/* Summary KPIs - Sempre visíveis */}
        <div className="grid gap-4 md:grid-cols-2">
          {kpis?.summary.map((kpi, index) => (
            <KpiCardWithTooltip 
              key={index} 
              kpi={kpi} 
              description={getKpiDescription(kpi.label)}
            />
          ))}
        </div>

        {/* Tabs */}
        <SocialMediaTabs tabs={tabs} defaultTab="discord" />
      </div>
    </DashboardLayout>
  );
}
