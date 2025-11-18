import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Building2, TrendingUp, GraduationCap, RefreshCw, DollarSign, Users, MessageSquare, ThumbsUp, User as UserIcon, TrendingUpIcon } from "lucide-react";
import { IntegrationStatus } from "@/components/IntegrationStatus";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { KpiCardWithTooltip } from "@/components/KpiCardWithTooltip";
import { getKpiDescription } from "@/lib/kpiDescriptions";
import { PeriodFilter, type PeriodFilter as PeriodFilterType } from "@/components/PeriodFilter";
import { useState } from "react";

export default function Home() {
  // Authentication temporarily disabled - direct access
  return (
    <DashboardLayout>
      <HomeContent />
    </DashboardLayout>
  );
}

function HomeContent() {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterType>({ type: 'current_month' });
  // Note: periodFilter is visual only until we have historical snapshots
  const { data: overview, isLoading, refetch } = trpc.consolidatedKpis.overview.useQuery();

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Função para formatar número
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  // Função para formatar percentual
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao dashboard de KPIs do Grupo Blue
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodFilter value={periodFilter} onChange={setPeriodFilter} />
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Faturamento Total */}
        <KpiCardWithTooltip
          title="Faturamento Total"
          value={formatCurrency(overview?.sales.totalRevenue || 0)}
          description="Blue Consult - Pipedrive"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          tooltip={getKpiDescription('faturamento_total')}
        />

        {/* Seguidores Totais */}
        <KpiCardWithTooltip
          title="Seguidores Totais"
          value={formatNumber(overview?.socialMedia.totalFollowers || 0)}
          description="Todas as redes sociais"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          tooltip={getKpiDescription('seguidores_totais')}
        />

        {/* Membros Discord */}
        <KpiCardWithTooltip
          title="Membros Discord"
          value={formatNumber(overview?.community.totalMembers || 0)}
          description="Tokeniza Academy"
          icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
          tooltip={getKpiDescription('membros_discord')}
        />

        {/* Engajamento Médio */}
        <KpiCardWithTooltip
          title="Engajamento Médio"
          value={formatPercent(overview?.socialMedia.averageEngagement || 0)}
          description="Redes sociais"
          icon={<ThumbsUp className="h-4 w-4 text-muted-foreground" />}
          tooltip={getKpiDescription('engajamento_medio')}
        />
      </div>

      {/* Métricas Financeiras */}
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCardWithTooltip
          title="Receitas"
          value={formatCurrency(overview?.financial.totalIncome || 0)}
          description="Nibo - Blue Consult"
          valueClassName="text-green-600"
          tooltip={getKpiDescription('receitas')}
        />

        <KpiCardWithTooltip
          title="Despesas"
          value={formatCurrency(overview?.financial.totalExpenses || 0)}
          description="Nibo - Blue Consult"
          valueClassName="text-red-600"
          tooltip={getKpiDescription('despesas')}
        />

        <KpiCardWithTooltip
          title="Saldo"
          value={formatCurrency(overview?.financial.balance || 0)}
          description="Lucro/Prejuízo"
          valueClassName={(overview?.financial.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}
          tooltip={getKpiDescription('saldo')}
        />
      </div>

      {/* Performance por Empresa */}
      <Card>
        <CardHeader>
          <CardTitle>Performance por Empresa</CardTitle>
          <CardDescription>Seguidores e engajamento nas redes sociais</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overview?.socialMedia.byCompany || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="followers" fill="#8884d8" name="Seguidores" />
              <Bar yAxisId="right" dataKey="engagement" fill="#82ca9d" name="Engajamento (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cards de Empresas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/blue-consult'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blue Consult</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overview?.sales.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">41 negócios</p>
            <p className="text-xs text-green-600 mt-1">✓ Consultoria em IR Cripto</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/tokeniza'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokeniza</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview?.socialMedia.byCompany.find(c => c.name === 'Tokeniza')?.followers || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">seguidores</p>
            <p className="text-xs text-green-600 mt-1">✓ Plataforma & Private</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/tokeniza-academy'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokeniza Academy</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview?.community.totalMembers || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">membros Discord</p>
            <p className="text-xs text-green-600 mt-1">✓ Academy & Discord</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/mychel-mendes'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mychel Mendes</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview?.socialMedia.byCompany.find(c => c.name === 'Mychel Mendes')?.followers || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">seguidores</p>
            <p className="text-xs text-green-600 mt-1">✓ Influenciador Digital</p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Redes Sociais */}
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCardWithTooltip
          title="Posts Totais"
          value={formatNumber(overview?.socialMedia.totalPosts || 0)}
          description="Todas as empresas"
          tooltip={getKpiDescription('posts_totais')}
        />

        <KpiCardWithTooltip
          title="Alcance Total"
          value={formatNumber(overview?.socialMedia.totalReach || 0)}
          description="Impressões únicas"
          tooltip={getKpiDescription('alcance_total')}
        />

        <KpiCardWithTooltip
          title="Interações Totais"
          value={formatNumber(overview?.socialMedia.totalInteractions || 0)}
          description="Curtidas, comentários, compartilhamentos"
          tooltip={getKpiDescription('interacoes_totais')}
        />
      </div>

      {/* Status das Integrações */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Status das Integrações</CardTitle>
            <CardDescription>Monitoramento em tempo real das APIs conectadas</CardDescription>
          </div>
          <Button onClick={() => refetch()} variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          <IntegrationStatus />
        </CardContent>
      </Card>
    </div>
  );
}
