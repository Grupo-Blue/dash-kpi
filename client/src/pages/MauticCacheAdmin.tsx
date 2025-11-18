/**
 * Página de administração do cache do Mautic
 * Permite sincronizar e-mails e páginas manualmente
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Database, Mail, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MauticCacheAdmin() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<{ emails: any; pages: any } | null>(null);

  // Query para buscar estatísticas do cache
  const { data: stats, refetch: refetchStats } = trpc.mauticCache.getStats.useQuery();

  // Mutation para sincronizar tudo
  const syncAllMutation = trpc.mauticCache.syncAll.useMutation({
    onSuccess: (result) => {
      setLastSync(result);
      refetchStats();
      toast.success('Sincronização concluída!', {
        description: `E-mails: ${result.emails.synced} sincronizados. Páginas: ${result.pages.synced} sincronizadas.`,
      });
      setSyncing(false);
    },
    onError: (error) => {
      toast.error('Erro na sincronização', {
        description: error.message,
      });
      setSyncing(false);
    },
  });

  // Mutation para sincronizar apenas e-mails
  const syncEmailsMutation = trpc.mauticCache.syncEmails.useMutation({
    onSuccess: (result) => {
      refetchStats();
      toast.success('E-mails sincronizados!', {
        description: `${result.synced} e-mails sincronizados, ${result.errors} erros.`,
      });
    },
    onError: (error) => {
      toast.error('Erro ao sincronizar e-mails', {
        description: error.message,
      });
    },
  });

  // Mutation para sincronizar apenas páginas
  const syncPagesMutation = trpc.mauticCache.syncPages.useMutation({
    onSuccess: (result) => {
      refetchStats();
      toast.success('Páginas sincronizadas!', {
        description: `${result.synced} páginas sincronizadas, ${result.errors} erros.`,
      });
    },
    onError: (error) => {
      toast.error('Erro ao sincronizar páginas', {
        description: error.message,
      });
    },
  });

  const handleSyncAll = async () => {
    setSyncing(true);
    toast.info('Sincronizando...', {
      description: 'Buscando dados do Mautic. Isso pode levar alguns segundos.',
    });
    syncAllMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="w-8 h-8" />
            Administração do Cache do Mautic
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie o cache de e-mails e páginas do Mautic para melhorar a performance da análise de leads.
          </p>
        </div>

        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas do Cache</CardTitle>
            <CardDescription>Dados atualmente armazenados no banco de dados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Mail className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.emailsCount || 0}</p>
                  <p className="text-sm text-muted-foreground">E-mails em cache</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <FileText className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.pagesCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Páginas em cache</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sincronização */}
        <Card>
          <CardHeader>
            <CardTitle>Sincronização Manual</CardTitle>
            <CardDescription>Atualize o cache com os dados mais recentes do Mautic</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sincronizar Tudo */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-6 h-6 text-purple-500" />
                <div>
                  <p className="font-semibold">Sincronizar Tudo</p>
                  <p className="text-sm text-muted-foreground">E-mails e páginas (recomendado)</p>
                </div>
              </div>
              <Button
                onClick={handleSyncAll}
                disabled={syncing || syncAllMutation.isPending}
                className="gap-2"
              >
                {syncing || syncAllMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Sincronizar
                  </>
                )}
              </Button>
            </div>

            {/* Sincronizar E-mails */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="font-semibold">Sincronizar E-mails</p>
                  <p className="text-sm text-muted-foreground">Apenas e-mails do Mautic</p>
                </div>
              </div>
              <Button
                onClick={() => syncEmailsMutation.mutate({ limit: 500 })}
                disabled={syncEmailsMutation.isPending}
                variant="outline"
                className="gap-2"
              >
                {syncEmailsMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Sincronizar
                  </>
                )}
              </Button>
            </div>

            {/* Sincronizar Páginas */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-semibold">Sincronizar Páginas</p>
                  <p className="text-sm text-muted-foreground">Apenas landing pages do Mautic</p>
                </div>
              </div>
              <Button
                onClick={() => syncPagesMutation.mutate({ limit: 500 })}
                disabled={syncPagesMutation.isPending}
                variant="outline"
                className="gap-2"
              >
                {syncPagesMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Sincronizar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Último Resultado */}
        {lastSync && (
          <Card>
            <CardHeader>
              <CardTitle>Última Sincronização</CardTitle>
              <CardDescription>Resultado da última sincronização completa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <p className="font-semibold">E-mails</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{lastSync.emails.synced} sincronizados</span>
                    </div>
                    {lastSync.emails.errors > 0 && (
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm">{lastSync.emails.errors} erros</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-green-500" />
                    <p className="font-semibold">Páginas</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{lastSync.pages.synced} sincronizadas</span>
                    </div>
                    {lastSync.pages.errors > 0 && (
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm">{lastSync.pages.errors} erros</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações */}
        <Card>
          <CardHeader>
            <CardTitle>Sobre o Cache</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              • O cache armazena nomes de e-mails e páginas do Mautic no banco de dados local.
            </p>
            <p>
              • Isso melhora significativamente a performance da análise de leads, evitando chamadas repetidas à API.
            </p>
            <p>
              • Recomenda-se sincronizar diariamente ou quando novos e-mails/páginas forem criados no Mautic.
            </p>
            <p>
              • A sincronização busca até 500 itens mais recentes de cada tipo.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
