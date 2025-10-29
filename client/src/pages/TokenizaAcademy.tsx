import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { RefreshCw, Users, MessageSquare, TrendingUp, Hash, Heart, MessageCircle, Share2, Eye, BarChart3, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { KpiCardWithTooltip } from "@/components/KpiCardWithTooltip";
import { getKpiDescription } from "@/lib/kpiDescriptions";

export default function TokenizaAcademy() {
  const { data: kpis, isLoading, refetch } = trpc.kpis.tokenizaAcademy.useQuery();
  // Tokeniza Academy blogId: 3893327 (userId: 3061390)
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

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

        {/* Summary KPIs */}
        <div className="grid gap-4 md:grid-cols-2">
          {kpis?.summary.map((kpi, index) => (
            <KpiCardWithTooltip 
              key={index} 
              kpi={kpi} 
              description={getKpiDescription(kpi.label)}
            />
          ))}
        </div>

        {/* Discord Metrics */}
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
                <ChannelItem name="geral" messages={1234} rank={1} />
                <ChannelItem name="trading" messages={987} rank={2} />
                <ChannelItem name="análises" messages={765} rank={3} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Community Stats - Removido temporariamente (dados hardcoded) */}

        {/* Course Platform */}
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

        {/* Integration Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status das Integrações</CardTitle>
            <CardDescription>Configure as APIs para dados em tempo real</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <IntegrationStatus
              name="Discord API"
              status="pending"
              description="Configure o bot do Discord para métricas da comunidade"
            />
            <IntegrationStatus
              name="Tokeniza Academy API"
              status="pending"
              description="Dados de cursos e alunos"
            />
          </CardContent>
        </Card>

        {/* Social Media Section */}
        {socialKpis && (
          <>
            <div className="mt-8">
              <h2 className="text-2xl font-bold tracking-tight mb-4">Redes Sociais</h2>
              <p className="text-muted-foreground mb-6">
                Métricas de performance nas redes sociais
              </p>
            </div>

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
                    {socialKpis.topPosts.map((post, index) => (
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

interface KpiCardProps {
  kpi: {
    value: number | string;
    label: string;
    change?: number | string;
    trend?: "up" | "down" | "stable";
  };
}

function KpiCard({ kpi }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardDescription>{kpi.label}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{kpi.value}</div>
        {kpi.change !== undefined && (
          <div className="flex items-center gap-1 text-sm mt-2 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>{typeof kpi.change === 'number' ? Math.abs(kpi.change) : kpi.change}</span>
            <span className="text-muted-foreground text-xs">vs período anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MetricRowProps {
  label: string;
  value: number;
  total: number | string;
  icon: React.ElementType;
}

function MetricRow({ label, value, total, icon: Icon }: MetricRowProps) {
  const percentage = typeof total === 'number' ? Math.round((value / total) * 100) : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="w-4 h-4" />
          <span className="text-sm">{label}</span>
        </div>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className="bg-primary rounded-full h-2 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{percentage}% do total</p>
    </div>
  );
}

interface ChannelItemProps {
  name: string;
  messages: number;
  rank: number;
}

function ChannelItem({ name, messages, rank }: ChannelItemProps) {
  const getRankColor = () => {
    if (rank === 1) return "bg-yellow-500";
    if (rank === 2) return "bg-gray-400";
    if (rank === 3) return "bg-orange-600";
    return "bg-muted";
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full ${getRankColor()} flex items-center justify-center text-white font-bold text-sm`}>
          {rank}
        </div>
        <div>
          <p className="font-medium">#{name}</p>
          <p className="text-sm text-muted-foreground">{messages.toLocaleString()} mensagens</p>
        </div>
      </div>
      <Hash className="w-5 h-5 text-muted-foreground" />
    </div>
  );
}

interface StatItemProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  trend?: "up" | "down";
  change?: number;
}

function StatItem({ label, value, icon: Icon, trend, change }: StatItemProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-sm ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
          <TrendingUp className={`w-4 h-4 ${trend === "down" ? "rotate-180" : ""}`} />
          <span>{change}%</span>
        </div>
      )}
    </div>
  );
}

interface IntegrationStatusProps {
  name: string;
  status: "connected" | "pending" | "error";
  description: string;
}

function IntegrationStatus({ name, status, description }: IntegrationStatusProps) {
  const getStatusColor = () => {
    if (status === "connected") return "bg-green-500";
    if (status === "error") return "bg-red-500";
    return "bg-yellow-500";
  };

  const getStatusText = () => {
    if (status === "connected") return "Conectado";
    if (status === "error") return "Erro";
    return "Pendente";
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{getStatusText()}</span>
        <Button variant="ghost" size="sm">
          Configurar
        </Button>
      </div>
    </div>
  );
}
