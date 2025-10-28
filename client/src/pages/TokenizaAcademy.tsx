import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { RefreshCw, Users, MessageSquare, TrendingUp, Hash } from "lucide-react";
import { toast } from "sonner";

export default function TokenizaAcademy() {
  const { data: kpis, isLoading, refetch } = trpc.kpis.tokenizaAcademy.useQuery();
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
            <KpiCard key={index} kpi={kpi} />
          ))}
        </div>

        {/* Discord Metrics */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Membros Ativos - Discord</CardTitle>
              <CardDescription>Atividade da comunidade por período</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <MetricRow
                  label="Membros Ativos Diários"
                  value={kpis?.activeMembers.daily ?? 0}
                  total={kpis?.summary[0]?.value ?? 0}
                  icon={Users}
                />
                <MetricRow
                  label="Membros Ativos Semanais"
                  value={kpis?.activeMembers.weekly ?? 0}
                  total={kpis?.summary[0]?.value ?? 0}
                  icon={Users}
                />
                <MetricRow
                  label="Membros Ativos Mensais"
                  value={kpis?.activeMembers.monthly ?? 0}
                  total={kpis?.summary[0]?.value ?? 0}
                  icon={Users}
                />
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

        {/* Community Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas da Comunidade</CardTitle>
            <CardDescription>Métricas gerais do Discord</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <StatItem
                label="Novos Membros (Mês)"
                value={127}
                icon={Users}
                trend="up"
                change={8.5}
              />
              <StatItem
                label="Mensagens (Mês)"
                value="5,643"
                icon={MessageSquare}
                trend="up"
                change={12.3}
              />
              <StatItem
                label="Canais Ativos"
                value={24}
                icon={Hash}
              />
              <StatItem
                label="Taxa de Resposta"
                value="94%"
                icon={TrendingUp}
                trend="up"
                change={2.1}
              />
            </div>
          </CardContent>
        </Card>

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
