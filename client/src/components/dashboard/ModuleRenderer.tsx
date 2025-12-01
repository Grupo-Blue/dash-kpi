/**
 * ModuleRenderer Component
 * 
 * Renderiza o conteúdo de um módulo de dashboard baseado nos dados retornados pela API.
 */

import { trpc } from '../../lib/trpc';
import type { DateRange } from '../../dashboard/dateRange';

type ModuleRendererProps = {
  companySlug: string;
  moduleId: string;
  dateRange: DateRange;
  compare?: boolean;
};

export function ModuleRenderer({
  companySlug,
  moduleId,
  dateRange,
  compare = false,
}: ModuleRendererProps) {
  const { data, isLoading, error } = trpc.dashboard.getModule.useQuery({
    companySlug,
    moduleId: moduleId as any, // Type assertion for now
    dateRange,
    compare,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-red-900">Erro ao carregar módulo</h3>
            <p className="text-sm text-red-700 mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Nenhum dado disponível</p>
      </div>
    );
  }

  // Renderizar summary (KPIs)
  const hasSummary = data.summary && data.summary.length > 0;
  const hasCharts = data.charts && data.charts.length > 0;
  const hasTables = data.tables && data.tables.length > 0;

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      {hasSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.summary.map((kpi) => (
            <div
              key={kpi.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <p className="text-sm text-gray-600 mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-900">
                {kpi.value !== null ? kpi.value : '—'}
              </p>
              {kpi.trend && (
                <div className="flex items-center gap-1 mt-2">
                  {kpi.trend.direction === 'up' && (
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {kpi.trend.direction === 'down' && (
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className={`text-sm font-medium ${
                    kpi.trend.direction === 'up' ? 'text-green-600' :
                    kpi.trend.direction === 'down' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {kpi.trend.deltaPercent !== null ? `${kpi.trend.deltaPercent.toFixed(1)}%` : '—'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Placeholder para quando não há dados */}
      {!hasSummary && !hasCharts && !hasTables && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Módulo em desenvolvimento
          </h3>
          <p className="text-gray-600">
            Os dados deste módulo serão implementados nas próximas sprints.
          </p>
        </div>
      )}

      {/* Charts - Placeholder */}
      {hasCharts && (
        <div className="space-y-4">
          {data.charts.map((chart) => (
            <div
              key={chart.id}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{chart.title}</h3>
              <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                <p className="text-gray-500">Gráfico será implementado em breve</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tables - Placeholder */}
      {hasTables && (
        <div className="space-y-4">
          {data.tables.map((table) => (
            <div
              key={table.id}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{table.title}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      {table.columns.map((col) => (
                        <th
                          key={col.id}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {table.rows.map((row, idx) => (
                      <tr key={idx}>
                        {table.columns.map((col) => (
                          <td key={col.id} className="px-4 py-3 text-sm text-gray-900">
                            {row[col.id] ?? '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
