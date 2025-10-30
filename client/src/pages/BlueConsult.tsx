import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { RefreshCw, TrendingUp, TrendingDown, Minus, DollarSign, Users, Clock, Heart, MessageCircle, Share2, Eye, BarChart3, ExternalLink, Wallet, Building2 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { toast } from "sonner";
import { KpiCardWithTooltip } from "@/components/KpiCardWithTooltip";
import { getKpiDescription } from "@/lib/kpiDescriptions";
import { SocialMediaTabs } from "@/components/SocialMediaTabs";
import { CompanyChat } from "@/components/CompanyChat";

export default function BlueConsult() {
  const companyId = 30001; // Blue Consult ID
  const { data: kpis, isLoading, refetch } = trpc.kpis.blueConsult.useQuery();
  const { data: niboKpis, isLoading: niboLoading, error: niboError } = trpc.kpis.niboFinancial.useQuery(undefined, {
    retry: false,
  });
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
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

  // Vendas (Pipedrive) Tab
  const vendasTab = (
    <div className="space-y-6">
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
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Deals by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Negócios por Status</CardTitle>
            <CardDescription>Distribuição atual do pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpis?.dealsByStatus || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="status" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {(kpis?.dealsByStatus || []).map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.status === 'won' ? '#10b981' :
                        entry.status === 'lost' ? '#ef4444' :
                        entry.status === 'open' ? '#3b82f6' :
                        '#6b7280'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Client Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Clientes</CardTitle>
          <CardDescription>Resumo do mês atual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Negócios Criados</span>
              </div>
              <div className="text-3xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">
                Novos negócios este mês
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="text-sm">Novos Clientes</span>
              </div>
              <div className="text-3xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Clientes adquiridos
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Tempo Médio</span>
              </div>
              <div className="text-3xl font-bold">18d</div>
              <p className="text-xs text-muted-foreground">
                Ciclo de venda
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Financeiro (Nibo) Tab
  const financeiroTab = niboKpis ? (
    <div className="space-y-6">
      {/* Financial Summary KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {niboKpis.summary.map((kpi: any, index: number) => (
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
    </div>
  ) : niboError ? (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">Erro ao carregar dados financeiros do Nibo</p>
          <p className="text-sm text-muted-foreground">{niboError.message}</p>
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg text-muted-foreground mt-4">Carregando dados financeiros...</p>
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
      id: 'vendas',
      label: 'Vendas',
      icon: <DollarSign className="h-4 w-4" />,
      content: vendasTab,
    },
    {
      id: 'financeiro',
      label: 'Financeiro',
      icon: <Wallet className="h-4 w-4" />,
      content: financeiroTab,
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

        {/* Summary KPIs - Sempre visíveis */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {kpis?.summary.map((kpi, index) => (
            <KpiCardWithTooltip 
              key={index} 
              kpi={kpi} 
              description={getKpiDescription(kpi.label)}
            />
          ))}
        </div>

        {/* Tabs */}
        <SocialMediaTabs tabs={tabs} defaultTab="vendas" />
      </div>
      
      {/* AI Chat Assistant */}
      <CompanyChat companyId={companyId} companyName="Blue Consult" />
    </DashboardLayout>
  );
}
