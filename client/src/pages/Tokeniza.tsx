import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Users, UserCheck, UserX, Calendar } from "lucide-react";
import { toast } from "sonner";
import { KpiCardWithTooltip } from "@/components/KpiCardWithTooltip";
import { getKpiDescription } from "@/lib/kpiDescriptions";

export default function Tokeniza() {
  const { data: kpis, isLoading, error, refetch } = trpc.kpis.tokeniza.useQuery();
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
    refreshMutation.mutate({ companySlug: "tokeniza" });
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

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tokeniza</h1>
            <p className="text-muted-foreground mt-2">
              KPIs da plataforma e Tokeniza Private
            </p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-4">{error.message}</p>
                <Button onClick={() => window.location.href = '/'}>Configurar Integração</Button>
              </div>
            </CardContent>
          </Card>
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
            <h1 className="text-3xl font-bold tracking-tight">Tokeniza</h1>
            <p className="text-muted-foreground mt-2">
              KPIs da plataforma e Tokeniza Private
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshMutation.isPending}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
            Atualizar Dados
          </Button>
        </div>

        {/* Summary KPIs */}
        <div className="grid gap-4 md:grid-cols-3">
          {(kpis as any)?.summary?.map((kpi: any, index: number) => (
            <KpiCardWithTooltip 
              key={index} 
              kpi={kpi} 
              description={getKpiDescription(kpi.label)}
            />
          ))}
        </div>

        {/* Tokeniza Private Details */}
        <Card>
          <CardHeader>
            <CardTitle>Tokeniza Private - Investidores</CardTitle>
            <CardDescription>Métricas detalhadas do grupo de elite</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <MetricItem
                label="Investidores Ativos"
                value={156}
                icon={UserCheck}
                description="Total de investidores ativos"
              />
              <MetricItem
                label="Investidores Inativos"
                value={23}
                icon={UserX}
                variant="warning"
                description="Sem investimentos recentes"
              />
              <MetricItem
                label="Ticket Médio"
                value="R$ 45.000"
                icon={DollarSign}
                description="Valor médio por investidor"
              />
              <MetricItem
                label="Último Investimento"
                value="5 dias"
                icon={Calendar}
                description="Tempo desde último deal"
              />
            </div>
          </CardContent>
        </Card>

        {/* Platform Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Plataforma Tokeniza</CardTitle>
            <CardDescription>Métricas gerais da plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Ofertas Públicas Ativas</span>
                </div>
                <div className="text-3xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  Ofertas disponíveis para investimento
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Usuários Cadastrados</span>
                </div>
                <div className="text-3xl font-bold">2,847</div>
                <p className="text-xs text-muted-foreground">
                  Total de usuários na plataforma
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Volume Tokenizado</span>
                </div>
                <div className="text-3xl font-bold">R$ 12.5M</div>
                <p className="text-xs text-muted-foreground">
                  Volume total de ativos tokenizados
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
              name="Tokeniza API"
              status="pending"
              description="Configure a API para buscar dados de investidores"
            />
            <IntegrationStatus
              name="Metricool"
              status="pending"
              description="Métricas de redes sociais e marketing"
            />
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
    change?: number;
    trend?: "up" | "down" | "stable";
    metadata?: Record<string, any>;
  };
}

function KpiCard({ kpi }: KpiCardProps) {
  const getTrendIcon = () => {
    if (kpi.trend === "up") return <TrendingUp className="w-4 h-4" />;
    if (kpi.trend === "down") return <TrendingDown className="w-4 h-4" />;
    return null;
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
            <span>{Math.abs(kpi.change)}%</span>
            <span className="text-muted-foreground text-xs">vs período anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MetricItemProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  variant?: "default" | "warning";
  description?: string;
}

function MetricItem({ label, value, icon: Icon, variant = "default", description }: MetricItemProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{label}</span>
      </div>
      <div className={`text-3xl font-bold ${variant === "warning" ? "text-orange-600" : ""}`}>
        {value}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
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
