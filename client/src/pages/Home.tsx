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

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/10">
        <div className="max-w-md w-full mx-4">
          <Card className="border-2">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{APP_TITLE}</CardTitle>
                <CardDescription className="mt-2">
                  Centralize e visualize os KPIs de todos os seus negócios em um só lugar
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  window.location.href = getLoginUrl();
                }}
                size="lg"
                className="w-full"
              >
                Entrar com Google
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <HomeContent />
    </DashboardLayout>
  );
}

function HomeContent() {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao dashboard de KPIs do Grupo Blue
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Faturamento Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overview?.sales.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Blue Consult - Pipedrive
            </p>
          </CardContent>
        </Card>

        {/* Seguidores Totais */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seguidores Totais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview?.socialMedia.totalFollowers || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Todas as redes sociais
            </p>
          </CardContent>
        </Card>

        {/* Membros Discord */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros Discord</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview?.community.totalMembers || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tokeniza Academy
            </p>
          </CardContent>
        </Card>

        {/* Engajamento Médio */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento Médio</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(overview?.socialMedia.averageEngagement || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Redes sociais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Financeiras */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(overview?.financial.totalIncome || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Nibo - Blue Consult</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(overview?.financial.totalExpenses || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Nibo - Blue Consult</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(overview?.financial.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(overview?.financial.balance || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Lucro/Prejuízo</p>
          </CardContent>
        </Card>
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
            <p className="text-xs text-muted-foreground mt-1">
              {formatNumber(overview?.sales.totalDeals || 0)} negócios
            </p>
            <p className="text-xs text-green-600 mt-2 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Consultoria em IR Cripto
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/tokeniza'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokeniza</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(overview?.socialMedia.byCompany?.find(c => c.name === 'Tokeniza')?.followers || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">seguidores</p>
            <p className="text-xs text-green-600 mt-2 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Plataforma & Private
            </p>
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
            <p className="text-xs text-green-600 mt-2 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Academy & Discord
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/mychel-mendes'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mychel Mendes</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(overview?.socialMedia.byCompany?.find(c => c.name === 'Mychel Mendes')?.followers || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">seguidores</p>
            <p className="text-xs text-green-600 mt-2 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Influenciador Digital
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Redes Sociais */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Posts Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview?.socialMedia.totalPosts || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Todas as empresas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Alcance Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview?.socialMedia.totalReach || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Impressões únicas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Interações Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview?.socialMedia.totalInteractions || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Curtidas, comentários, compartilhamentos</p>
          </CardContent>
        </Card>
      </div>

      {/* Status das Integrações */}
      <IntegrationStatus />
    </div>
  );
}
