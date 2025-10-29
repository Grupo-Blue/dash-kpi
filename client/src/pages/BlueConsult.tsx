import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { RefreshCw, TrendingUp, TrendingDown, Minus, DollarSign, Users, Clock, Heart, MessageCircle, Share2, Eye, BarChart3, ExternalLink } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { toast } from "sonner";
import { KpiCardWithTooltip } from "@/components/KpiCardWithTooltip";
import { getKpiDescription } from "@/lib/kpiDescriptions";

export default function BlueConsult() {
  const { data: kpis, isLoading, refetch } = trpc.kpis.blueConsult.useQuery();
  const { data: niboKpis, isLoading: niboLoading, error: niboError } = trpc.kpis.niboFinancial.useQuery(undefined, {
    retry: false,
  });
  // Blue Consult blogId: 3893423 (userId: 3061390)
  const { data: socialKpis, isLoading: socialLoading } = trpc.kpis.metricoolSocialMedia.useQuery({
    blogId: '3893423', // Blue Consult
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
    refreshMutation.mutate({ companySlug: "blue-consult" });
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
            <h1 className="text-3xl font-bold tracking-tight">Blue Consult</h1>
            <p className="text-muted-foreground mt-2">
              KPIs de vendas e marketing - IR Cripto
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshMutation.isPending}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
            Atualizar Dados
          </Button>
        </div>

        {/* Summary KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {kpis?.summary.map((kpi, index) => (
            <KpiCardWithTooltip 
              key={index} 
              kpi={kpi} 
              description={getKpiDescription(kpi.label)}
            />
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Faturamento Mensal</CardTitle>
              <CardDescription>Últimos 12 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={kpis?.revenueTimeSeries || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Faturamento']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sales Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Funil de Vendas</CardTitle>
              <CardDescription>Pipeline atual</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={kpis?.salesFunnel || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    type="number"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="stage"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    width={150}
                  />
                  <Tooltip 
                    formatter={(value: number) => [value, 'Leads']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Implementation Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline de Implantação</CardTitle>
            <CardDescription>Clientes em onboarding (CS)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpis?.implementationPipeline || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  type="number"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  type="category" 
                  dataKey="stage"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  width={180}
                />
                <Tooltip 
                  formatter={(value: number) => [value, 'Clientes']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Financial KPIs from Nibo */}
        {niboKpis && (
          <>
            <div className="mt-8">
              <h2 className="text-2xl font-bold tracking-tight mb-4">Dados Financeiros</h2>
              <p className="text-muted-foreground mb-6">
                Informações financeiras integradas do Nibo
              </p>
            </div>

            {/* Financial Summary KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {niboKpis.summary.map((kpi, index) => (
                <KpiCardWithTooltip 
                  key={index} 
                  kpi={kpi} 
                  description={getKpiDescription(kpi.label)}
                />
              ))}
            </div>

            {/* Monthly Cash Flow Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Fluxo de Caixa Mensal</CardTitle>
                <CardDescription>Últimos 12 meses - Recebimentos vs Pagamentos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={niboKpis.monthlyCashFlow}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="month" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        const labels: Record<string, string> = {
                          receivables: 'Recebimentos',
                          payables: 'Pagamentos',
                          balance: 'Saldo'
                        };
                        return [`R$ ${value.toLocaleString('pt-BR')}`, labels[name] || name];
                      }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="receivables" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981' }}
                      name="Recebimentos"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="payables" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ fill: '#ef4444' }}
                      name="Pagamentos"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                      name="Saldo"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}

        {/* Client Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Clientes</CardTitle>
            <CardDescription>Resumo do mês atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              <MetricItem
                label="Negócios Criados"
                value={45}
                icon={DollarSign}
              />
            </div>
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

            {/* Followers by Network */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Seguidores por Rede Social</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Instagram */}
                {socialKpis?.followers?.instagram && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Instagram</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(socialKpis.followers.instagram.current)}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {socialKpis.followers.instagram.growth > 0 ? '+' : ''}{formatNumber(socialKpis.followers.instagram.growth)} 
                        ({socialKpis.followers.instagram.growthPercentage > 0 ? '+' : ''}{socialKpis.followers.instagram.growthPercentage.toFixed(1)}%) vs mês anterior
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Facebook */}
                {socialKpis?.followers?.facebook && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Facebook</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(socialKpis.followers.facebook.current)}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {socialKpis.followers.facebook.growth > 0 ? '+' : ''}{formatNumber(socialKpis.followers.facebook.growth)} 
                        ({socialKpis.followers.facebook.growthPercentage > 0 ? '+' : ''}{socialKpis.followers.facebook.growthPercentage.toFixed(1)}%) vs mês anterior
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* YouTube */}
                {socialKpis?.followers?.youtube && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">YouTube</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(socialKpis.followers.youtube.current)}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {socialKpis.followers.youtube.growth > 0 ? '+' : ''}{formatNumber(socialKpis.followers.youtube.growth)} 
                        ({socialKpis.followers.youtube.growthPercentage > 0 ? '+' : ''}{socialKpis.followers.youtube.growthPercentage.toFixed(1)}%) vs mês anterior
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Performance by Network */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Performance por Rede Social</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Instagram Breakdown */}
                {socialKpis?.networkBreakdown?.instagram && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Instagram</CardTitle>
                      <CardDescription>Performance no Instagram</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Posts</span>
                        <span className="font-medium">{socialKpis.networkBreakdown.instagram.posts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Reels</span>
                        <span className="font-medium">{socialKpis.networkBreakdown.instagram.reels}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Stories</span>
                        <span className="font-medium">{socialKpis.networkBreakdown.instagram.stories}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-sm font-medium">Engagement Total</span>
                        <span className="font-bold text-primary">{socialKpis.networkBreakdown.instagram.totalEngagement.toFixed(1)}%</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Facebook Breakdown */}
                {socialKpis?.networkBreakdown?.facebook && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Facebook</CardTitle>
                      <CardDescription>Performance no Facebook</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Posts</span>
                        <span className="font-medium">{socialKpis.networkBreakdown.facebook.posts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Reels</span>
                        <span className="font-medium">{socialKpis.networkBreakdown.facebook.reels}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-sm font-medium">Engagement Total</span>
                        <span className="font-bold text-primary">{socialKpis.networkBreakdown.facebook.totalEngagement.toFixed(1)}%</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* YouTube Breakdown */}
                {socialKpis?.networkBreakdown?.youtube && (
                  <Card>
                    <CardHeader>
                      <CardTitle>YouTube</CardTitle>
                      <CardDescription>Performance no YouTube</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Vídeos</span>
                        <span className="font-medium">{socialKpis.networkBreakdown.youtube.videos}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Visualizações</span>
                        <span className="font-medium">{formatNumber(socialKpis.networkBreakdown.youtube.totalViews)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Tempo de Exibição</span>
                        <span className="font-medium">{formatNumber(socialKpis.networkBreakdown.youtube.totalWatchTime)} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Duração Média</span>
                        <span className="font-medium">{socialKpis.networkBreakdown.youtube.averageViewDuration}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Likes</span>
                        <span className="font-medium">{formatNumber(socialKpis.networkBreakdown.youtube.totalLikes)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Comentários</span>
                        <span className="font-medium">{formatNumber(socialKpis.networkBreakdown.youtube.totalComments)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-sm font-medium">Engagement Total</span>
                        <span className="font-bold text-primary">{socialKpis.networkBreakdown.youtube.totalEngagement.toFixed(1)}%</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Top YouTube Videos */}
            {socialKpis?.topYouTubeVideos && socialKpis.topYouTubeVideos.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Top 5 Vídeos do YouTube</CardTitle>
                  <CardDescription>Vídeos com melhor performance por visualizações</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {socialKpis.topYouTubeVideos.map((video, index) => (
                      <a 
                        key={index} 
                        href={video.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium truncate flex-1">{video.title}</p>
                            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {formatNumber(video.views)} views
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {formatNumber(video.likes)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {formatNumber(video.comments)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="text-lg font-bold text-primary">{formatNumber(video.views)}</div>
                          <div className="text-xs text-muted-foreground">visualizações</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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
    metadata?: Record<string, any>;
  };
}

function KpiCard({ kpi }: KpiCardProps) {
  const getTrendIcon = () => {
    if (kpi.trend === "up") return <TrendingUp className="w-4 h-4" />;
    if (kpi.trend === "down") return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (kpi.trend === "up") return "text-green-600";
    if (kpi.trend === "down") return "text-red-600";
    return "text-muted-foreground";
  };

  const formatValue = (value: number | string) => {
    if (typeof value === "number" && kpi.metadata?.currency === "BRL") {
      return `R$ ${value.toLocaleString("pt-BR")}`;
    }
    return value;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardDescription>{kpi.label}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(kpi.value)}</div>
        {kpi.change !== undefined && (
          <div className={`flex items-center gap-1 text-sm mt-2 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{typeof kpi.change === 'number' ? Math.abs(kpi.change) : kpi.change}</span>
            <span className="text-muted-foreground text-xs">vs mês anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MetricItemProps {
  label: string;
  value?: number;
  icon: React.ElementType;
  variant?: "default" | "danger";
}

function MetricItem({ label, value, icon: Icon, variant = "default" }: MetricItemProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${variant === "danger" ? "text-red-600" : ""}`}>
        {value ?? 0}
      </div>
    </div>
  );
}
