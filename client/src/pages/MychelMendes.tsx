import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { RefreshCw, TrendingUp, Instagram, Facebook, Youtube, Twitter, Linkedin, MessageSquare, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { KpiCardWithTooltip } from "@/components/KpiCardWithTooltip";
import { getKpiDescription } from "@/lib/kpiDescriptions";
import { SocialMediaTabs } from "@/components/SocialMediaTabs";
import { SocialMediaManualEntryModal } from "@/components/SocialMediaManualEntryModal";
import { TikTokManualEntryModal } from "@/components/TikTokManualEntryModal";
import { CompanyChat } from "@/components/CompanyChat";
import { PeriodFilter, type PeriodFilter as PeriodFilterType } from "@/components/PeriodFilter";
import { useState } from "react";

export default function MychelMendes() {
  const companyId = 30004; // Mychel Mendes ID
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterType>({ type: 'current_month' });
  const [twitterModalOpen, setTwitterModalOpen] = useState(false);
  const [linkedinModalOpen, setLinkedinModalOpen] = useState(false);
  const [threadsModalOpen, setThreadsModalOpen] = useState(false);
  const [tiktokModalOpen, setTiktokModalOpen] = useState(false);
  
  const { data: socialKpis, isLoading, error, refetch } = trpc.kpis.metricoolSocialMedia.useQuery({
    blogId: '3893476', // Mychel Mendes
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
    refreshMutation.mutate({ companySlug: "mychel-mendes" });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
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
            <h1 className="text-3xl font-bold tracking-tight">Mychel Mendes</h1>
            <p className="text-muted-foreground mt-2">
              Métricas de Redes Sociais e Marketing Digital
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

  // Visão Geral Tab - Seguidores de todas as redes
  const overviewTab = (
    <div>
      <h2 className="text-2xl font-bold mb-4">Seguidores por Rede Social</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {['instagram', 'facebook', 'youtube', 'twitter', 'linkedin', 'tiktok', 'threads'].map((network) => {
          const networkData = socialKpis?.followers?.[network];
          const networkNames: Record<string, string> = {
            instagram: 'Instagram',
            facebook: 'Facebook',
            youtube: 'YouTube',
            twitter: 'Twitter/X',
            linkedin: 'LinkedIn',
            tiktok: 'TikTok',
            threads: 'Threads'
          };
          
          return (
            <Card key={network}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{networkNames[network]}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(networkData?.current || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  {(networkData?.growth || 0) >= 0 ? '+' : ''}
                  {formatNumber(networkData?.growth || 0)} ({(networkData?.growthPercentage || 0) >= 0 ? '+' : ''}
                  {(networkData?.growthPercentage || 0).toFixed(1)}%) vs mês anterior
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // Instagram Tab
  const instagramTab = (
    <Card>
      <CardHeader>
        <CardTitle>Performance no Instagram</CardTitle>
        <CardDescription>Métricas detalhadas do Instagram</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Conteúdo</h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Posts</span>
              <span className="font-bold">{socialKpis?.networkBreakdown?.instagram?.posts || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Reels</span>
              <span className="font-bold">{socialKpis?.networkBreakdown?.instagram?.reels || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Stories</span>
              <span className="font-bold">{socialKpis?.networkBreakdown?.instagram?.stories || 0}</span>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Engajamento</h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Engagement Total</span>
              <span className="font-bold">{(socialKpis?.networkBreakdown?.instagram?.totalEngagement || 0).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Interações</span>
              <span className="font-bold">{formatNumber(socialKpis?.networkBreakdown?.instagram?.totalInteractions || 0)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Facebook Tab
  const facebookTab = (
    <Card>
      <CardHeader>
        <CardTitle>Performance no Facebook</CardTitle>
        <CardDescription>Métricas detalhadas do Facebook</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Conteúdo</h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Posts</span>
              <span className="font-bold">{socialKpis?.networkBreakdown?.facebook?.posts || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Reels</span>
              <span className="font-bold">{socialKpis?.networkBreakdown?.facebook?.reels || 0}</span>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Engajamento</h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Engagement Total</span>
              <span className="font-bold">{(socialKpis?.networkBreakdown?.facebook?.totalEngagement || 0).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // YouTube Tab
  const youtubeTab = (
    <Card>
      <CardHeader>
        <CardTitle>Performance no YouTube</CardTitle>
        <CardDescription>Métricas detalhadas do YouTube</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Conteúdo</h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Vídeos</span>
              <span className="font-bold">{socialKpis?.networkBreakdown?.youtube?.videos || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Visualizações</span>
              <span className="font-bold">{formatNumber(socialKpis?.networkBreakdown?.youtube?.totalViews || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tempo de Exibição</span>
              <span className="font-bold">{formatNumber(socialKpis?.networkBreakdown?.youtube?.totalWatchTime || 0)} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Duração Média</span>
              <span className="font-bold">{formatDuration(socialKpis?.networkBreakdown?.youtube?.averageViewDuration || 0)}</span>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Engajamento</h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Likes</span>
              <span className="font-bold">{formatNumber(socialKpis?.networkBreakdown?.youtube?.totalLikes || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Comentários</span>
              <span className="font-bold">{formatNumber(socialKpis?.networkBreakdown?.youtube?.totalComments || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Engagement Total</span>
              <span className="font-bold">{(socialKpis?.networkBreakdown?.youtube?.totalEngagement || 0).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  // Twitter/X Tab
  const twitterTab = (
    <Card>
      <CardHeader>
        <CardTitle>Performance no Twitter/X</CardTitle>
        <CardDescription>Métricas detalhadas do Twitter/X</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mb-4"
          onClick={() => setTwitterModalOpen(true)}
        >
          Registrar Dados Manualmente
        </Button>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Conteúdo</h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tweets</span>
              <span className="font-bold">{socialKpis?.networkBreakdown?.twitter?.tweets || 0}</span>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Engajamento</h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Engagement Total</span>
              <span className="font-bold">{(socialKpis?.networkBreakdown?.twitter?.totalEngagement || 0).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  // LinkedIn Tab
  const linkedinTab = (
    <Card>
      <CardHeader>
        <CardTitle>Performance no LinkedIn</CardTitle>
        <CardDescription>Métricas detalhadas do LinkedIn</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mb-4"
          onClick={() => setLinkedinModalOpen(true)}
        >
          Registrar Dados Manualmente
        </Button>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Conteúdo</h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Posts</span>
              <span className="font-bold">{socialKpis?.networkBreakdown?.linkedin?.posts || 0}</span>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Engajamento</h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Engagement Total</span>
              <span className="font-bold">{(socialKpis?.networkBreakdown?.linkedin?.totalEngagement || 0).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // TikTok Tab
  const tiktokTab = (
    <Card>
      <CardHeader>
        <CardTitle>Performance no TikTok</CardTitle>
        <CardDescription>Métricas detalhadas do TikTok</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mb-4"
          onClick={() => setTiktokModalOpen(true)}
        >
          Registrar Dados Manualmente
        </Button>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Conteúdo</h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Vídeos</span>
              <span className="font-bold">{socialKpis?.networkBreakdown?.tiktok?.videos || 0}</span>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Engajamento</h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Engagement Total</span>
              <span className="font-bold">{(socialKpis?.networkBreakdown?.tiktok?.totalEngagement || 0).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Threads Tab
  const threadsTab = (
    <Card>
      <CardHeader>
        <CardTitle>Performance no Threads</CardTitle>
        <CardDescription>Métricas detalhadas do Threads</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mb-4"
          onClick={() => setThreadsModalOpen(true)}
        >
          Registrar Dados Manualmente
        </Button>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Conteúdo</h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Threads</span>
              <span className="font-bold">{socialKpis?.networkBreakdown?.threads?.threads || 0}</span>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Engajamento</h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Engagement Total</span>
              <span className="font-bold">{(socialKpis?.networkBreakdown?.threads?.totalEngagement || 0).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );



  const tabs = [
    {
      id: 'overview',
      label: 'Visão Geral',
      icon: <TrendingUp className="h-4 w-4" />,
      content: overviewTab,
    },
    {
      id: 'instagram',
      label: 'Instagram',
      icon: <Instagram className="h-4 w-4" />,
      content: instagramTab,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: <Facebook className="h-4 w-4" />,
      content: facebookTab,
    },
    {
      id: 'youtube',
      label: 'YouTube',
      icon: <Youtube className="h-4 w-4" />,
      content: youtubeTab,
    },
    {
      id: 'twitter',
      label: 'Twitter/X',
      icon: <Twitter className="h-4 w-4" />,
      content: twitterTab,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: <Linkedin className="h-4 w-4" />,
      content: linkedinTab,
    },
    {
      id: 'tiktok',
      label: 'TikTok',
      icon: <MessageSquare className="h-4 w-4" />,
      content: tiktokTab,
    },
    {
      id: 'threads',
      label: 'Threads',
      icon: <MessageSquare className="h-4 w-4" />,
      content: threadsTab,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mychel Mendes</h1>
            <p className="text-muted-foreground mt-2">
              Métricas de Redes Sociais e Marketing Digital
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PeriodFilter value={periodFilter} onChange={setPeriodFilter} />
            <Button onClick={handleRefresh} disabled={refreshMutation.isPending}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
              Atualizar Dados
            </Button>
          </div>
        </div>

        {/* Summary KPIs - Sempre visíveis */}
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

        {/* Tabs de Redes Sociais */}
        <SocialMediaTabs tabs={tabs} defaultTab="overview" />
        
        {/* Top Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Posts por Engagement</CardTitle>
            <CardDescription>Posts com maior engajamento nas redes sociais</CardDescription>
          </CardHeader>
          <CardContent>
            {socialKpis?.topPosts && socialKpis.topPosts.length > 0 ? (
              <div className="space-y-4">
                {socialKpis.topPosts.slice(0, 5).map((post: any, index: number) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{post.content || 'Sem legenda'}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {formatNumber(post.interactions || 0)} interações
                        </span>
                        <span>{post.network || 'Desconhecido'}</span>
                        {post.url && (
                          <a 
                            href={post.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Ver post
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum post disponível</p>
            )}
          </CardContent>
        </Card>
        
        {/* Modais de Registro Manual */}
        <TikTokManualEntryModal 
          open={tiktokModalOpen}
          onOpenChange={setTiktokModalOpen}
          companySlug="mychel-mendes"
          onSuccess={refetch}
        />
        <SocialMediaManualEntryModal 
          open={twitterModalOpen}
          onOpenChange={setTwitterModalOpen}
          platform="twitter"
          companySlug="mychel-mendes"
          onSuccess={refetch}
        />
        <SocialMediaManualEntryModal 
          open={linkedinModalOpen}
          onOpenChange={setLinkedinModalOpen}
          platform="linkedin"
          companySlug="mychel-mendes"
          onSuccess={refetch}
        />
        <SocialMediaManualEntryModal 
          open={threadsModalOpen}
          onOpenChange={setThreadsModalOpen}
          platform="threads"
          companySlug="mychel-mendes"
          onSuccess={refetch}
        />
      </div>
      
      {/* AI Chat Assistant */}
      <CompanyChat companyId={companyId} companyName="Mychel Mendes" />
    </DashboardLayout>
  );
}
