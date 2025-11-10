import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Building2, TrendingUp, GraduationCap, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { IntegrationStatus } from "@/components/IntegrationStatus";

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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
          <p className="text-muted-foreground mt-2">
            Bem-vindo ao dashboard de KPIs do Grupo Blue
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <CompanyCard
            title="Blue Consult"
            description="Consultoria em IR Cripto"
            icon={Building2}
            href="/blue-consult"
          />

          <CompanyCard
            title="Tokeniza"
            description="Plataforma & Private"
            icon={TrendingUp}
            href="/tokeniza"
          />

          <CompanyCard
            title="Tokeniza Academy"
            description="Academy & Discord"
            icon={GraduationCap}
            href="/tokeniza-academy"
          />
        </div>

        <IntegrationStatus />

        <Card>
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
            <CardDescription>
              Configure as integrações para começar a visualizar dados reais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div>
                <p className="font-medium">Configurar Pipedrive</p>
                <p className="text-sm text-muted-foreground">Blue Consult - Dados de vendas</p>
              </div>
              <Button variant="ghost" size="sm">
                Configurar
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div>
                <p className="font-medium">Configurar Discord</p>
                <p className="text-sm text-muted-foreground">Tokeniza Academy - Métricas de comunidade</p>
              </div>
              <Button variant="ghost" size="sm">
                Configurar
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div>
                <p className="font-medium">Configurar Tokeniza API</p>
                <p className="text-sm text-muted-foreground">Tokeniza - Dados de investidores</p>
              </div>
              <Button variant="ghost" size="sm">
                Configurar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

interface CompanyCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  stats?: Array<{ label: string; value: string }>;
}

function CompanyCard({ title, description, icon: Icon, href, stats }: CompanyCardProps) {
  return (
    <Link href={href}>
      <a>
        <Card className="hover:shadow-lg transition-all cursor-pointer group h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <CardTitle className="mt-4">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          {stats && stats.length > 0 && (
            <CardContent className="space-y-3">
              {stats.map((stat, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <span className="font-semibold">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      </a>
    </Link>
  );
}
