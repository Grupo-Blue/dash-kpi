import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { RefreshCw, Users, MessageSquare, TrendingUp, Hash, Heart, MessageCircle, Share2, Eye, BarChart3, ExternalLink, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { KpiCardWithTooltip } from "@/components/KpiCardWithTooltip";
import { getKpiDescription } from "@/lib/kpiDescriptions";
import { SocialMediaTabs } from "@/components/SocialMediaTabs";
import { CompanyChat } from "@/components/CompanyChat";

export default function TokenizaAcademy() {
  const companyId = 4; // Tokeniza Academy ID
  const { data: kpis, isLoading, refetch } = trpc.kpis.tokenizaAcademy.useQuery();
  const { data: socialKpis, isLoading: socialLoading } = trpc.kpis.metricoolSocialMedia.useQuery({
    blogId: '3893327', // Tokeniza Academy
  });
  const { data: cademiKpis, isLoading: cademiLoading, error: cademiError } = trpc.kpis.cademiCourses.useQuery(undefined, {
    retry: false,
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
  const cursosTab = cademiKpis ? (
    <div className="space-y-6">
      {/* Main KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Alunos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cademiKpis.totalStudents.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className={cademiKpis.studentsVariation >= 0 ? 'text-green-600' : 'text-red-600'}>
                {cademiKpis.studentsVariation >= 0 ? '+' : ''}{cademiKpis.studentsVariation.toFixed(1)}%
              </span>
              {' '}nas últimas 4 semanas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Novos Alunos (30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cademiKpis.newStudentsLast30Days}</div>
            <p className="text-xs text-muted-foreground mt-1">Novos cadastros no último mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Cursos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cademiKpis.totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">Cursos disponíveis na plataforma</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nunca Acessaram</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cademiKpis.neverAccessed}</div>
            <p className="text-xs text-muted-foreground mt-1">Alunos que ainda não acessaram</p>
          </CardContent>
        </Card>
      </div>

      {/* Access Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Acessos</CardTitle>
          <CardDescription>Nos últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">{cademiKpis.accessLast30Days}</span>
              <span className="text-sm text-muted-foreground">Total de acessos</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Hoje</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-blue-500 rounded" style={{ width: `${(cademiKpis.accessDistribution.today / cademiKpis.accessLast30Days * 100)}px` }}></div>
                  <span className="text-sm font-medium">{cademiKpis.accessDistribution.today}</span>
                  <span className="text-xs text-muted-foreground">
                    {((cademiKpis.accessDistribution.today / cademiKpis.accessLast30Days) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Ontem</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-blue-400 rounded" style={{ width: `${(cademiKpis.accessDistribution.yesterday / cademiKpis.accessLast30Days * 100)}px` }}></div>
                  <span className="text-sm font-medium">{cademiKpis.accessDistribution.yesterday}</span>
                  <span className="text-xs text-muted-foreground">
                    {((cademiKpis.accessDistribution.yesterday / cademiKpis.accessLast30Days) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">2 a 7 dias</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-blue-300 rounded" style={{ width: `${(cademiKpis.accessDistribution.days2to7 / cademiKpis.accessLast30Days * 100)}px` }}></div>
                  <span className="text-sm font-medium">{cademiKpis.accessDistribution.days2to7}</span>
                  <span className="text-xs text-muted-foreground">
                    {((cademiKpis.accessDistribution.days2to7 / cademiKpis.accessLast30Days) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">7 a 14 dias</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-orange-300 rounded" style={{ width: `${(cademiKpis.accessDistribution.days7to14 / cademiKpis.accessLast30Days * 100)}px` }}></div>
                  <span className="text-sm font-medium">{cademiKpis.accessDistribution.days7to14}</span>
                  <span className="text-xs text-muted-foreground">
                    {((cademiKpis.accessDistribution.days7to14 / cademiKpis.accessLast30Days) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">14 a 30 dias</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-red-300 rounded" style={{ width: `${(cademiKpis.accessDistribution.days14to30 / cademiKpis.accessLast30Days * 100)}px` }}></div>
                  <span className="text-sm font-medium">{cademiKpis.accessDistribution.days14to30}</span>
                  <span className="text-xs text-muted-foreground">
                    {((cademiKpis.accessDistribution.days14to30 / cademiKpis.accessLast30Days) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Never Accessed */}
      <Card>
        <CardHeader>
          <CardTitle>Nunca Acessou</CardTitle>
          <CardDescription>Alunos que ainda não acessaram a plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">{cademiKpis.neverAccessed}</div>
          <p className="text-sm text-muted-foreground mt-2">
            {((cademiKpis.neverAccessed / cademiKpis.totalStudents) * 100).toFixed(1)}% do total de alunos
          </p>
        </CardContent>
      </Card>

      {/* Top Active Students */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Alunos Mais Ativos</CardTitle>
          <CardDescription>Alunos com acessos mais recentes nos últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cademiKpis.topActiveStudents.map((student, index) => (
              <div key={student.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {student.daysAgo === 0 ? 'Hoje' : student.daysAgo === 1 ? 'Ontem' : `${student.daysAgo} dias atrás`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(student.lastAccess).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  ) : cademiError ? (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Erro ao carregar dados da Cademi</p>
          <p className="text-sm text-red-600 mt-2">{cademiError.message}</p>
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </CardContent>
    </Card>
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
      
      {/* AI Chat Assistant */}
      <CompanyChat companyId={companyId} companyName="Tokeniza Academy" />
    </DashboardLayout>
  );
}
