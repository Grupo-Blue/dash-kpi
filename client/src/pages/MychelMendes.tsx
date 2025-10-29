import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { RefreshCw, TrendingUp, Heart, MessageCircle, Share2, Eye, BarChart3, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { KpiCardWithTooltip } from "@/components/KpiCardWithTooltip";
import { getKpiDescription } from "@/lib/kpiDescriptions";

export default function MychelMendes() {
  // Mychel Mendes blogId: 3893476 (userId: 3061390)
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

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
          <Button onClick={handleRefresh} disabled={refreshMutation.isPending}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
            Atualizar Dados
          </Button>
        </div>

        {/* Summary KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Posts</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{socialKpis?.totalPosts || 0}</div>
              <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interações</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(socialKpis?.totalInteractions || 0)}</div>
              <p className="text-xs text-muted-foreground">Likes + Comments + Shares</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(socialKpis?.averageEngagement || 0).toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">Taxa de engajamento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alcance Total</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(socialKpis?.totalReach || 0)}</div>
              <p className="text-xs text-muted-foreground">Pessoas alcançadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impressões</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(socialKpis?.totalImpressions || 0)}</div>
              <p className="text-xs text-muted-foreground">Total de visualizações</p>
            </CardContent>
          </Card>
        </div>

        {/* Followers Section - All 8 Networks */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Seguidores por Rede Social</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Instagram</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(socialKpis?.followers?.instagram?.current || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  {(socialKpis?.followers?.instagram?.growth || 0) >= 0 ? '+' : ''}
                  {formatNumber(socialKpis?.followers?.instagram?.growth || 0)} ({(socialKpis?.followers?.instagram?.growthPercentage || 0) >= 0 ? '+' : ''}
                  {(socialKpis?.followers?.instagram?.growthPercentage || 0).toFixed(1)}%) vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Facebook</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(socialKpis?.followers?.facebook?.current || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  {(socialKpis?.followers?.facebook?.growth || 0) >= 0 ? '+' : ''}
                  {formatNumber(socialKpis?.followers?.facebook?.growth || 0)} ({(socialKpis?.followers?.facebook?.growthPercentage || 0) >= 0 ? '+' : ''}
                  {(socialKpis?.followers?.facebook?.growthPercentage || 0).toFixed(1)}%) vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">YouTube</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(socialKpis?.followers?.youtube?.current || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  {(socialKpis?.followers?.youtube?.growth || 0) >= 0 ? '+' : ''}
                  {formatNumber(socialKpis?.followers?.youtube?.growth || 0)} ({(socialKpis?.followers?.youtube?.growthPercentage || 0) >= 0 ? '+' : ''}
                  {(socialKpis?.followers?.youtube?.growthPercentage || 0).toFixed(1)}%) vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Twitter/X</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(socialKpis?.followers?.twitter?.current || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  {(socialKpis?.followers?.twitter?.growth || 0) >= 0 ? '+' : ''}
                  {formatNumber(socialKpis?.followers?.twitter?.growth || 0)} ({(socialKpis?.followers?.twitter?.growthPercentage || 0) >= 0 ? '+' : ''}
                  {(socialKpis?.followers?.twitter?.growthPercentage || 0).toFixed(1)}%) vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">LinkedIn</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(socialKpis?.followers?.linkedin?.current || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  {(socialKpis?.followers?.linkedin?.growth || 0) >= 0 ? '+' : ''}
                  {formatNumber(socialKpis?.followers?.linkedin?.growth || 0)} ({(socialKpis?.followers?.linkedin?.growthPercentage || 0) >= 0 ? '+' : ''}
                  {(socialKpis?.followers?.linkedin?.growthPercentage || 0).toFixed(1)}%) vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">TikTok</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(socialKpis?.followers?.tiktok?.current || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  {(socialKpis?.followers?.tiktok?.growth || 0) >= 0 ? '+' : ''}
                  {formatNumber(socialKpis?.followers?.tiktok?.growth || 0)} ({(socialKpis?.followers?.tiktok?.growthPercentage || 0) >= 0 ? '+' : ''}
                  {(socialKpis?.followers?.tiktok?.growthPercentage || 0).toFixed(1)}%) vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Threads</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(socialKpis?.followers?.threads?.current || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  {(socialKpis?.followers?.threads?.growth || 0) >= 0 ? '+' : ''}
                  {formatNumber(socialKpis?.followers?.threads?.growth || 0)} ({(socialKpis?.followers?.threads?.growthPercentage || 0) >= 0 ? '+' : ''}
                  {(socialKpis?.followers?.threads?.growthPercentage || 0).toFixed(1)}%) vs mês anterior
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Network Breakdown - All 8 Networks */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Performance por Rede Social</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Instagram</CardTitle>
                <CardDescription>Performance no Instagram</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Posts</span>
                    <span className="font-bold">{socialKpis?.networkBreakdown.instagram.posts || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Reels</span>
                    <span className="font-bold">{socialKpis?.networkBreakdown.instagram.reels || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Stories</span>
                    <span className="font-bold">{socialKpis?.networkBreakdown.instagram.stories || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Engagement Total</span>
                    <span className="font-bold">{(socialKpis?.networkBreakdown.instagram.totalEngagement || 0).toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Facebook</CardTitle>
                <CardDescription>Performance no Facebook</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Posts</span>
                    <span className="font-bold">{socialKpis?.networkBreakdown.facebook.posts || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Reels</span>
                    <span className="font-bold">{socialKpis?.networkBreakdown.facebook.reels || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t mt-auto">
                    <span className="text-sm text-muted-foreground">Engagement Total</span>
                    <span className="font-bold">{(socialKpis?.networkBreakdown.facebook.totalEngagement || 0).toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>YouTube</CardTitle>
                <CardDescription>Performance no YouTube</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Vídeos</span>
                    <span className="font-bold">{socialKpis?.networkBreakdown.youtube.videos || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Visualizações</span>
                    <span className="font-bold">{formatNumber(socialKpis?.networkBreakdown.youtube.totalViews || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tempo de Exibição</span>
                    <span className="font-bold">{formatNumber(socialKpis?.networkBreakdown.youtube.totalWatchTime || 0)} min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Duração Média</span>
                    <span className="font-bold">{(socialKpis?.networkBreakdown.youtube.averageViewDuration || 0).toFixed(0)}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Likes</span>
                    <span className="font-bold">{formatNumber(socialKpis?.networkBreakdown.youtube.totalLikes || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Comentários</span>
                    <span className="font-bold">{formatNumber(socialKpis?.networkBreakdown.youtube.totalComments || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Engagement Total</span>
                    <span className="font-bold">{(socialKpis?.networkBreakdown.youtube.totalEngagement || 0).toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Twitter/X</CardTitle>
                <CardDescription>Performance no Twitter/X</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Posts</span>
                    <span className="font-bold">{socialKpis?.networkBreakdown.twitter.posts || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t mt-auto">
                    <span className="text-sm text-muted-foreground">Engagement Total</span>
                    <span className="font-bold">{(socialKpis?.networkBreakdown.twitter.totalEngagement || 0).toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>LinkedIn</CardTitle>
                <CardDescription>Performance no LinkedIn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Posts</span>
                    <span className="font-bold">{socialKpis?.networkBreakdown.linkedin.posts || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t mt-auto">
                    <span className="text-sm text-muted-foreground">Engagement Total</span>
                    <span className="font-bold">{(socialKpis?.networkBreakdown.linkedin.totalEngagement || 0).toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>TikTok</CardTitle>
                <CardDescription>Performance no TikTok</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Vídeos</span>
                    <span className="font-bold">{socialKpis?.networkBreakdown.tiktok.videos || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t mt-auto">
                    <span className="text-sm text-muted-foreground">Engagement Total</span>
                    <span className="font-bold">{(socialKpis?.networkBreakdown.tiktok.totalEngagement || 0).toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Threads</CardTitle>
                <CardDescription>Performance no Threads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Posts</span>
                    <span className="font-bold">{socialKpis?.networkBreakdown.threads.posts || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t mt-auto">
                    <span className="text-sm text-muted-foreground">Engagement Total</span>
                    <span className="font-bold">{(socialKpis?.networkBreakdown.threads.totalEngagement || 0).toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Top YouTube Videos */}
        {socialKpis?.topYouTubeVideos && socialKpis.topYouTubeVideos.length > 0 && (
          <Card>
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
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center font-bold text-red-500">
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
                        <span title="Tempo de Exibição">
                          {formatNumber(video.watchTime)} min
                        </span>
                        <span title="Duração Média">
                          {video.averageViewDuration.toFixed(0)}s avg
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-lg font-bold text-red-500">{formatNumber(video.views)}</div>
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
      </div>
    </DashboardLayout>
  );
}
