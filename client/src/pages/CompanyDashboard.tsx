/**
 * CompanyDashboard Page
 * 
 * Página principal de dashboard para uma empresa específica.
 * Exibe módulos configuráveis baseados nas integrações ativas.
 */

import { useState } from 'react';
import { useParams, Redirect } from 'wouter';
import { useDateRange, useDashboardModules, getPresetRange } from '../dashboard';
import { DateRangePicker } from '../components/dashboard/DateRangePicker';
import { ModuleRenderer } from '../components/dashboard/ModuleRenderer';
import type { DatePreset } from '../dashboard/dateRange';

export default function CompanyDashboard() {
  const { companySlug } = useParams<{ companySlug: string }>();

  if (!companySlug) {
    return <Redirect to="/" />;
  }

  // State para período
  const { dateRange, setPreset } = useDateRange(companySlug, 'last_30_days');

  // Carregar módulos disponíveis
  const { modules, isLoading: modulesLoading, isError } = useDashboardModules(companySlug);

  // State para aba ativa
  const [activeModuleId, setActiveModuleId] = useState<string>('overview');
  
  // State para comparação de períodos
  const [compareEnabled, setCompareEnabled] = useState<boolean>(false);

  // Atualizar aba ativa quando módulos carregarem
  if (modules.length > 0 && !modules.find(m => m.id === activeModuleId)) {
    setActiveModuleId(modules[0].id);
  }

  const handlePresetChange = (preset: DatePreset) => {
    setPreset(preset);
  };

  // Mapear slug para nome da empresa
  const companyNames: Record<string, string> = {
    'blue-consult': 'Blue Consult',
    'tokeniza': 'Tokeniza',
    'tokeniza-academy': 'Tokeniza Academy',
    'mychel-mendes': 'Mychel Mendes',
  };

  const companyName = companyNames[companySlug] || companySlug;

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded-lg p-8 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <svg
              className="w-8 h-8 text-red-600"
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
            <h2 className="text-xl font-bold text-gray-900">Erro ao carregar dashboard</h2>
          </div>
          <p className="text-gray-600">
            Não foi possível carregar os módulos do dashboard. Verifique se a empresa existe e se você tem permissão de acesso.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{companyName}</h1>
              <p className="text-sm text-gray-500 mt-1">Dashboard de KPIs</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Toggle de comparação */}
              <button
                onClick={() => setCompareEnabled(!compareEnabled)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  compareEnabled
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Comparar com período anterior"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Comparar
              </button>
              <DateRangePicker
                value={dateRange.preset || 'last_30_days'}
                onChange={handlePresetChange}
              />
            </div>
          </div>

          {/* Tabs */}
          {modulesLoading ? (
            <div className="flex gap-4 pb-4">
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-4">
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => setActiveModuleId(module.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                    activeModuleId === module.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {module.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {modulesLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Carregando módulos...</p>
            </div>
          </div>
        ) : modules.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <svg
              className="w-16 h-16 text-yellow-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum módulo disponível
            </h3>
            <p className="text-gray-600">
              Configure as integrações na página de Administração para habilitar módulos de dashboard.
            </p>
          </div>
        ) : (
          <ModuleRenderer
            companySlug={companySlug}
            moduleId={activeModuleId}
            dateRange={dateRange}
            compare={compareEnabled}
          />
        )}
      </div>
    </div>
  );
}
