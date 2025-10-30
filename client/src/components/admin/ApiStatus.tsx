import { useState } from 'react';
import { trpc } from '../../lib/trpc';
import { CheckCircle2, XCircle, RefreshCw, AlertCircle } from 'lucide-react';

export function ApiStatus() {
  const { data: statuses, isLoading, refetch } = trpc.kpis.integrationStatus.useQuery();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getStatusIcon = (status: string) => {
    return status === 'online' ? (
      <CheckCircle2 className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusBadge = (status: string) => {
    return status === 'online' ? (
      <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
        Online
      </span>
    ) : (
      <span className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-full">
        Offline
      </span>
    );
  };

  const formatLastCheck = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getCompanyInfo = (apiName: string) => {
    const companyMap: Record<string, { description: string; company: string }> = {
      'Pipedrive': { description: 'CRM e Pipeline de Vendas', company: 'Blue Consult' },
      'Discord': { description: 'Comunidade e Engajamento', company: 'Tokeniza Academy' },
      'Nibo': { description: 'Dados Financeiros', company: 'Blue Consult' },
      'Metricool': { description: 'Redes Sociais e Marketing', company: 'Todas as empresas' },
    };
    return companyMap[apiName] || { description: 'Integração', company: 'Desconhecida' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Status das APIs</h2>
          <p className="mt-1 text-sm text-gray-600">
            Monitoramento em tempo real das integrações conectadas
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Alert se alguma API estiver offline */}
      {statuses && statuses.some((api) => api.status === 'offline') && (
        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Algumas integrações estão offline
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              Verifique as credenciais e configurações das APIs marcadas como offline.
            </p>
          </div>
        </div>
      )}

      {/* Lista de APIs */}
      <div className="grid gap-4">
        {statuses?.map((api) => {
          const info = getCompanyInfo(api.name);
          const isOnline = api.status === 'online';

          return (
            <div
              key={api.name}
              className="flex items-center justify-between p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                {getStatusIcon(api.status)}
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{api.name}</h3>
                    {getStatusBadge(api.status)}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{info.description}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Empresa: <span className="font-medium">{info.company}</span>
                  </p>
                  {api.error && (
                    <p className="mt-1 text-xs text-red-600">
                      Erro: {api.error}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Última verificação</p>
                <p className="mt-1 text-sm font-medium text-gray-700">
                  {formatLastCheck(api.lastChecked)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info adicional */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900">ℹ️ Informações</h3>
        <ul className="mt-2 space-y-1 text-sm text-blue-800">
          <li>• O status é baseado no uso real das APIs (quando páginas carregam dados)</li>
          <li>• APIs offline podem indicar problemas de credenciais ou conectividade</li>
          <li>• Use o botão "Atualizar" para forçar uma nova verificação</li>
        </ul>
      </div>
    </div>
  );
}
