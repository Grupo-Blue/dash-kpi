import { useState } from 'react';
import { trpc } from '../../lib/trpc';
import { Plus, Pencil, Building2, Key } from 'lucide-react';
import { ConfigureApisModal } from './ConfigureApisModal';
import { AddCompanyModal } from './AddCompanyModal';

export function ManageCompanies() {
  const { data: companies, isLoading, refetch } = trpc.companies.getAll.useQuery();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  const handleConfigureApis = (company: any) => {
    setSelectedCompany(company);
    setShowConfigureModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Empresas</h2>
          <p className="mt-1 text-sm text-gray-600">
            Adicione novas empresas e configure as integrações de cada uma
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Adicionar Empresa
        </button>
      </div>

      {/* Lista de Empresas */}
      <div className="grid gap-4">
        {companies?.map((company: any) => (
          <div
            key={company.id}
            className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">Slug: {company.slug}</p>
                  {company.description && (
                    <p className="mt-2 text-sm text-gray-700">{company.description}</p>
                  )}
                  
                  {/* Integrações Configuradas */}
                  <div className="mt-4">
                    <p className="text-xs font-medium text-gray-500 uppercase">Integrações Configuradas</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {company.pipedriveApiToken && (
                        <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded">
                          Pipedrive
                        </span>
                      )}
                      {company.discordBotToken && (
                        <span className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded">
                          Discord
                        </span>
                      )}
                      {company.metricoolBlogId && (
                        <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                          Metricool
                        </span>
                      )}
                      {!company.pipedriveApiToken && !company.discordBotToken && !company.metricoolBlogId && (
                        <span className="text-xs text-gray-500">Nenhuma integração configurada</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleConfigureApis(company)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <Key className="w-4 h-4" />
                Configurar APIs
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-sm font-medium text-yellow-900">⚠️ Em Desenvolvimento</h3>
        <p className="mt-2 text-sm text-yellow-800">
          A funcionalidade completa de adicionar e editar empresas está em desenvolvimento.
          Por enquanto, você pode visualizar as empresas existentes e suas integrações configuradas.
        </p>
        <p className="mt-2 text-sm text-yellow-800">
          Para adicionar uma nova empresa ou configurar APIs, entre em contato com o administrador do sistema.
        </p>
      </div>

      {/* Modais */}
      {selectedCompany && (
        <ConfigureApisModal
          open={showConfigureModal}
          onClose={() => {
            setShowConfigureModal(false);
            setSelectedCompany(null);
          }}
          company={selectedCompany}
        />
      )}

      <AddCompanyModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
