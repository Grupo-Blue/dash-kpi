import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, AlertCircle, Settings } from "lucide-react";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingState } from "@/components/LoadingState";

interface IntegrationField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
}

interface IntegrationConfig {
  name: string;
  label: string;
  description: string;
  fields: IntegrationField[];
}

const AVAILABLE_INTEGRATIONS: IntegrationConfig[] = [
  {
    name: "pipedrive",
    label: "Pipedrive",
    description: "CRM e gestão de vendas",
    fields: [
      { name: "apiToken", label: "API Token", type: "password", required: true, placeholder: "Cole seu token da API do Pipedrive" },
    ],
  },
  {
    name: "nibo",
    label: "Nibo",
    description: "Gestão financeira e contábil",
    fields: [
      { name: "apiToken", label: "API Token", type: "password", required: true, placeholder: "Cole seu token da API do Nibo" },
    ],
  },
  {
    name: "metricool",
    label: "Metricool",
    description: "Análise de redes sociais",
    fields: [
      { name: "apiKey", label: "API Key", type: "password", required: true, placeholder: "Cole sua API Key do Metricool" },
      { name: "userId", label: "User ID", type: "text", required: true, placeholder: "Ex: 3061390" },
    ],
  },
  {
    name: "discord",
    label: "Discord",
    description: "Comunidade e engajamento",
    fields: [
      { name: "botToken", label: "Bot Token", type: "password", required: true, placeholder: "Cole o token do bot do Discord" },
      { name: "guildId", label: "Guild ID (Server ID)", type: "text", required: true, placeholder: "ID do servidor Discord" },
    ],
  },
  {
    name: "mautic",
    label: "Mautic",
    description: "Automação de marketing",
    fields: [
      { name: "baseUrl", label: "Base URL", type: "text", required: true, placeholder: "https://seu-mautic.com" },
      { name: "clientId", label: "Client ID", type: "text", required: true, placeholder: "OAuth Client ID" },
      { name: "clientSecret", label: "Client Secret", type: "password", required: true, placeholder: "OAuth Client Secret" },
      { name: "username", label: "Username (opcional)", type: "text", placeholder: "Usuário para autenticação" },
      { name: "password", label: "Password (opcional)", type: "password", placeholder: "Senha para autenticação" },
    ],
  },
  {
    name: "cademi",
    label: "Cademi",
    description: "Plataforma de cursos",
    fields: [
      { name: "apiKey", label: "API Key", type: "password", required: true, placeholder: "Cole sua API Key do Cademi" },
      { name: "baseUrl", label: "Base URL (opcional)", type: "text", placeholder: "https://api.cademi.com.br" },
    ],
  },
  {
    name: "tokeniza",
    label: "Tokeniza",
    description: "Investimentos e tokenização",
    fields: [
      { name: "apiToken", label: "API Token", type: "password", required: true, placeholder: "Cole seu token da API Tokeniza" },
      { name: "baseUrl", label: "Base URL (opcional)", type: "text", placeholder: "https://api.tokeniza.com.br/v1" },
    ],
  },
  {
    name: "tokeniza-academy",
    label: "Tokeniza Academy",
    description: "Educação financeira",
    fields: [
      { name: "apiToken", label: "API Token", type: "password", required: true, placeholder: "Cole seu token da API Tokeniza Academy" },
      { name: "baseUrl", label: "Base URL (opcional)", type: "text", placeholder: "https://academy.tokeniza.com.br/api/v1" },
    ],
  },
];

export default function Integrations() {
  const { user } = useAuth();
  const [editingService, setEditingService] = useState<string | null>(null);
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { data: integrations, isLoading, error, refetch } = trpc.adminIntegrations.getAll.useQuery();
  const updateMutation = trpc.adminIntegrations.updateCredentials.useMutation();
  const deleteMutation = trpc.adminIntegrations.deleteCredentials.useMutation();

  if (!user || user.role !== "admin") {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você precisa ser administrador para acessar esta página.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleEdit = (serviceName: string) => {
    const integration = integrations?.find((i) => i.serviceName === serviceName);
    const service = AVAILABLE_INTEGRATIONS.find((s) => s.name === serviceName);
    
    if (!service) return;

    // Pre-fill form with existing credentials
    const initialValues: Record<string, string> = {};
    
    if (integration) {
      // Try to load from config.credentials first
      const credentials = integration.config?.credentials || {};
      
      service.fields.forEach((field) => {
        if (credentials[field.name]) {
          initialValues[field.name] = credentials[field.name];
        }
      });

      // Fallback to legacy apiKey for simple services
      if (!Object.keys(initialValues).length && integration.apiKey) {
        const tokenField = service.fields.find(f => f.name.includes('Token') || f.name.includes('apiKey'));
        if (tokenField) {
          initialValues[tokenField.name] = integration.apiKey;
        }
      }
    }

    setFormState((prev) => ({
      ...prev,
      [serviceName]: initialValues,
    }));
    setEditingService(serviceName);
  };

  const handleSave = async (serviceName: string) => {
    const service = AVAILABLE_INTEGRATIONS.find((s) => s.name === serviceName);
    if (!service) return;

    const fields = formState[serviceName] || {};

    // Validate required fields
    const missingFields = service.fields
      .filter((f) => f.required && !fields[f.name]?.trim())
      .map((f) => f.label);

    if (missingFields.length > 0) {
      toast.error(`Campos obrigatórios faltando: ${missingFields.join(", ")}`);
      return;
    }

    setIsSaving(true);
    try {
      // Build payload based on service type
      let apiKey: string | undefined;
      let credentials: any = {};

      switch (serviceName) {
        case "pipedrive":
        case "nibo":
          apiKey = fields.apiToken;
          break;
        case "metricool":
          credentials = {
            apiKey: fields.apiKey,
            userId: fields.userId,
          };
          break;
        case "discord":
          credentials = {
            botToken: fields.botToken,
            guildId: fields.guildId,
          };
          break;
        case "mautic":
          credentials = {
            baseUrl: fields.baseUrl,
            clientId: fields.clientId,
            clientSecret: fields.clientSecret,
            username: fields.username || undefined,
            password: fields.password || undefined,
          };
          break;
        case "cademi":
          credentials = {
            apiKey: fields.apiKey,
            baseUrl: fields.baseUrl || undefined,
          };
          break;
        case "tokeniza":
        case "tokeniza-academy":
          credentials = {
            apiToken: fields.apiToken,
            baseUrl: fields.baseUrl || undefined,
          };
          break;
      }

      const result = await updateMutation.mutateAsync({
        serviceName,
        apiKey,
        config: { credentials },
        active: true,
      });

      if (result.success) {
        toast.success(result.message || "Credenciais salvas e testadas com sucesso!");
      } else {
        toast.warning(result.message || "Credenciais salvas, mas teste de conexão falhou");
      }

      setEditingService(null);
      setFormState((prev) => {
        const newState = { ...prev };
        delete newState[serviceName];
        return newState;
      });
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar credenciais");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (serviceName: string) => {
    const service = AVAILABLE_INTEGRATIONS.find((s) => s.name === serviceName);
    if (!confirm(`Deseja realmente remover as credenciais de ${service?.label}?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ serviceName });
      toast.success("Credenciais removidas com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao remover credenciais");
    }
  };

  const getIntegrationStatus = (serviceName: string) => {
    const integration = integrations?.find((i) => i.serviceName === serviceName);
    if (!integration) return { status: "not_configured", message: "Não configurado" };
    if (!integration.active) return { status: "inactive", message: "Inativo" };
    if (integration.testStatus === "success") return { status: "success", message: integration.testMessage || "Conectado" };
    if (integration.testStatus === "failed") return { status: "failed", message: integration.testMessage || "Erro de conexão" };
    return { status: "pending", message: "Pendente" };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Conectado
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Erro
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            Inativo
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="w-3 h-3 mr-1" />
            Não configurado
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <LoadingState size="lg" text="Carregando integrações..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <ErrorMessage error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gerenciamento de Integrações</h1>
        <p className="text-muted-foreground">
          Configure as credenciais de acesso às APIs externas utilizadas pelo dashboard.
        </p>
      </div>

      <div className="grid gap-4">
        {AVAILABLE_INTEGRATIONS.map((service) => {
          const integration = integrations?.find((i) => i.serviceName === service.name);
          const status = getIntegrationStatus(service.name);
          const isEditing = editingService === service.name;

          return (
            <Card key={service.name}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Settings className="w-5 h-5 text-muted-foreground" />
                      <CardTitle>{service.label}</CardTitle>
                      {getStatusBadge(status.status)}
                    </div>
                    <CardDescription>{service.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    {service.fields.map((field) => (
                      <div key={field.name}>
                        <Label htmlFor={`${service.name}-${field.name}`}>
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input
                          id={`${service.name}-${field.name}`}
                          type={field.type || "text"}
                          value={formState[service.name]?.[field.name] ?? ""}
                          onChange={(e) =>
                            setFormState((prev) => ({
                              ...prev,
                              [service.name]: {
                                ...prev[service.name],
                                [field.name]: e.target.value,
                              },
                            }))
                          }
                          placeholder={field.placeholder}
                          className="mt-1"
                        />
                      </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleSave(service.name)}
                        disabled={isSaving}
                      >
                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Salvar e Testar Conexão
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingService(null);
                          setFormState((prev) => {
                            const newState = { ...prev };
                            delete newState[service.name];
                            return newState;
                          });
                        }}
                        disabled={isSaving}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {integration && (
                      <div className="text-sm text-muted-foreground space-y-1">
                        {integration.lastTested && (
                          <p>
                            Último teste:{" "}
                            {new Date(integration.lastTested).toLocaleString("pt-BR")}
                          </p>
                        )}
                        {integration.testMessage && (
                          <p className={`text-xs ${status.status === 'failed' ? 'text-red-600 font-medium' : ''}`}>
                            {integration.testMessage}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleEdit(service.name)}
                      >
                        {integration ? "Editar Credenciais" : "Configurar"}
                      </Button>
                      {integration && (
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(service.name)}
                        >
                          Remover
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
