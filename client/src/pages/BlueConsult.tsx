import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { RefreshCw, TrendingUp, TrendingDown, Minus, DollarSign, Users, Clock } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { toast } from "sonner";

export default function BlueConsult() {
  const { data: kpis, isLoading, refetch } = trpc.kpis.blueConsult.useQuery();
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
            <KpiCard key={index} kpi={kpi} />
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

        {/* Client Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Clientes</CardTitle>
            <CardDescription>Resumo do mês atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              {/* <MetricItem
                label="Novos Clientes"
                value={kpis?.clientMetrics?.newClientsThisMonth || 0}
                icon={Users}
              /> */}
              {/* Temporarily disabled until clientMetrics is implemented */}
              {/* <MetricItem
                label="Churn"
                value={kpis?.clientMetrics?.churnThisMonth || 0}
                icon={TrendingDown}
                variant="danger"
              />
              <MetricItem
                label="Renovações Gold"
                value={kpis?.clientMetrics?.goldRenewals || 0}
                icon={TrendingUp}
              />
              <MetricItem
                label="Renovações Diamond"
                value={kpis?.clientMetrics?.diamondRenewals || 0}
                icon={TrendingUp}
              />
              <MetricItem
                label="Upgrades"
                value={kpis?.clientMetrics?.upgrades || 0}
                icon={TrendingUp}
              /> */}
              <MetricItem
                label="Negócios Criados"
                value={45}
                icon={DollarSign}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
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
