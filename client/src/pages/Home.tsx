import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Building2, TrendingUp, GraduationCap, RefreshCw, DollarSign, Users, MessageSquare, ThumbsUp, Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { IntegrationStatus } from "@/components/IntegrationStatus";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="max-w-md w-full mx-4">
          <Card className="border-2 shadow-2xl card-modern">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-10 h-10 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {APP_TITLE}
                </CardTitle>
                <CardDescription className="mt-3 text-base">
                  Centralize e visualize os KPIs de todos os seus negócios em um só lugar
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pb-8">
              <Button
                onClick={() => {
                  window.location.href = getLoginUrl();
                }}
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="space-y-8 p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-11 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Se não houver dados, não mostrar nada
  if (!overview) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <Card className="max-w-md w-full card-modern">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>Nenhum dado disponível</CardTitle>
              <CardDescription className="mt-2">
                Configure as credenciais das APIs na página de Administração para começar a visualizar os dados.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const hasRevenue = overview.totalRevenue && overview.totalRevenue > 0;
  const hasExpenses = overview.totalExpenses && overview.totalExpenses > 0;
  const hasFollowers = overview.totalFollowers && overview.totalFollowers > 0;
  const hasMembers = overview.totalDiscordMembers && overview.totalDiscordMembers > 0;

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Visão Geral
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Panorama consolidado de todas as empresas do Grupo Blue
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="lg"
          className="gap-2 hover-lift shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      {/* KPI Cards - Só mostrar se houver dados */}
      {(hasRevenue || hasExpenses || hasFollowers || hasMembers) && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Faturamento */}
          {hasRevenue && (
            <Card className="card-modern hover-lift overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Faturamento Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {formatCurrency(overview.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  Todas as empresas
                </p>
              </CardContent>
            </Card>
          )}

          {/* Seguidores */}
          {hasFollowers && (
            <Card className="card-modern hover-lift overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-chart-2/20 to-transparent rounded-bl-full" />
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Seguidores Totais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {formatNumber(overview.totalFollowers)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Todas as redes sociais
                </p>
              </CardContent>
            </Card>
          )}

          {/* Membros Discord */}
          {hasMembers && (
            <Card className="card-modern hover-lift overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-chart-3/20 to-transparent rounded-bl-full" />
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Membros Discord
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {formatNumber(overview.totalDiscordMembers)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Tokeniza Academy
                </p>
              </CardContent>
            </Card>
          )}

          {/* Despesas */}
          {hasExpenses && (
            <Card className="card-modern hover-lift overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-destructive/20 to-transparent rounded-bl-full" />
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Despesas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {formatCurrency(overview.totalExpenses)}
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <ArrowDownRight className="w-3 h-3 text-red-500" />
                  Nibo - Blue Consult
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Performance por Empresa */}
      {overview.companies && overview.companies.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Performance por Empresa</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {overview.companies.map((company) => (
              <Card key={company.name} className="card-modern hover-lift card-gradient">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {company.name === 'Blue Consult' && <Building2 className="w-5 h-5 text-primary" />}
                    {company.name === 'Tokeniza' && <TrendingUp className="w-5 h-5 text-chart-2" />}
                    {company.name === 'Tokeniza Academy' && <GraduationCap className="w-5 h-5 text-chart-3" />}
                    {company.name === 'Mychel Mendes' && <Sparkles className="w-5 h-5 text-chart-4" />}
                    {company.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {company.revenue > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Faturamento</p>
                      <p className="text-2xl font-bold">{formatCurrency(company.revenue)}</p>
                    </div>
                  )}
                  {company.followers > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Seguidores</p>
                      <p className="text-2xl font-bold">{formatNumber(company.followers)}</p>
                    </div>
                  )}
                  {company.members > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Membros</p>
                      <p className="text-2xl font-bold">{formatNumber(company.members)}</p>
                    </div>
                  )}
                  {company.description && (
                    <p className="text-xs text-muted-foreground pt-2 border-t">
                      {company.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Status das Integrações */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Status das Integrações</h2>
        </div>
        <Card className="card-modern">
          <CardContent className="pt-6">
            <IntegrationStatus />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
