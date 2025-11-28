import { useState } from "react";
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

const AVAILABLE_INTEGRATIONS = [
  { name: "pipedrive", label: "Pipedrive", description: "CRM e gestão de vendas" },
  { name: "nibo", label: "Nibo", description: "Gestão financeira e contábil" },
  { name: "mautic", label: "Mautic", description: "Automação de marketing" },
  { name: "metricool", label: "Metricool", description: "Análise de redes sociais" },
  { name: "discord", label: "Discord", description: "Comunidade e engajamento" },
  { name: "cademi", label: "Cademi", description: "Plataforma de cursos" },
  { name: "tokeniza", label: "Tokeniza", description: "Investimentos e tokenização" },
  { name: "tokeniza-academy", label: "Tokeniza Academy", description: "Educação financeira" },
];

export default function Integrations() {
  const { user } = useAuth();
  const [editingService, setEditingService] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
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

  const handleSave = async (serviceName: string) => {
    if (!apiKey.trim()) {
      toast.error("API Key é obrigatória");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateMutation.mutateAsync({
        serviceName,
        apiKey: apiKey.trim(),
        active: true,
      });

      if (result.success) {
        toast.success(result.message || "Credenciais salvas com sucesso!");
      } else {
        toast.warning(result.message || "Credenciais salvas, mas teste de conexão falhou");
      }

      setEditingService(null);
      setApiKey("");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar credenciais");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (serviceName: string) => {
    if (!confirm(`Deseja realmente remover as credenciais de ${serviceName}?`)) {
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
    if (integration.testStatus === "success") return { status: "success", message: "Conectado" };
    if (integration.testStatus === "failed") return { status: "failed", message: "Erro de conexão" };
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
                    <div>
                      <Label htmlFor={`${service.name}-api-key`}>API Key</Label>
                      <Input
                        id={`${service.name}-api-key`}
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Cole sua API Key aqui"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSave(service.name)}
                        disabled={isSaving}
                      >
                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Salvar e Testar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingService(null);
                          setApiKey("");
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
                          <p className="text-xs">{integration.testMessage}</p>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingService(service.name);
                          setApiKey(integration?.apiKey || "");
                        }}
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
