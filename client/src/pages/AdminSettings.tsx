import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

const INTEGRATION_CONFIGS = {
  pipedrive: {
    name: "Pipedrive",
    description: "CRM para gestão de vendas",
    fields: [
      { key: "apiToken", label: "API Token", type: "password" as const },
    ],
  },
  discord: {
    name: "Discord",
    description: "Comunidade Tokeniza Academy",
    fields: [
      { key: "botToken", label: "Bot Token", type: "password" as const },
      { key: "guildId", label: "Guild ID", type: "text" as const },
    ],
  },
  metricool: {
    name: "Metricool",
    description: "Métricas de redes sociais",
    fields: [
      { key: "apiToken", label: "API Token", type: "password" as const },
      { key: "userId", label: "User ID", type: "text" as const },
    ],
  },
  cademi: {
    name: "Cademi",
    description: "Plataforma de cursos",
    fields: [
      { key: "apiKey", label: "API Key", type: "password" as const },
    ],
  },
  nibo: {
    name: "Nibo",
    description: "Contabilidade e financeiro",
    fields: [
      { key: "apiToken", label: "API Token", type: "password" as const },
    ],
  },
  mautic: {
    name: "Mautic",
    description: "Marketing automation",
    fields: [
      { key: "baseUrl", label: "Base URL", type: "text" as const },
      { key: "clientId", label: "Client ID", type: "text" as const },
      { key: "clientSecret", label: "Client Secret", type: "password" as const },
      { key: "username", label: "Username", type: "text" as const },
      { key: "password", label: "Password", type: "password" as const },
    ],
  },
};

function IntegrationCard({ serviceName }: { serviceName: string }) {
  const config = INTEGRATION_CONFIGS[serviceName as keyof typeof INTEGRATION_CONFIGS];
  const utils = trpc.useUtils();
  
  const { data: integration, isLoading } = trpc.admin.getIntegration.useQuery({ serviceName });
  const updateMutation = trpc.admin.updateIntegration.useMutation({
    onSuccess: () => {
      toast.success(`${config.name} atualizado com sucesso`);
      utils.admin.getIntegrations.invalidate();
      utils.admin.getIntegration.invalidate({ serviceName });
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });
  
  const testMutation = trpc.admin.testIntegration.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`${config.name}: Conexão bem-sucedida!`);
      } else {
        toast.error(`${config.name}: ${data.message}`);
      }
      utils.admin.getIntegrations.invalidate();
      utils.admin.getIntegration.invalidate({ serviceName });
    },
    onError: (error) => {
      toast.error(`Erro ao testar: ${error.message}`);
    },
  });
  
  const toggleMutation = trpc.admin.toggleIntegration.useMutation({
    onSuccess: () => {
      utils.admin.getIntegrations.invalidate();
      utils.admin.getIntegration.invalidate({ serviceName });
    },
  });

  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState(false);

  // Initialize credentials when data loads
  useState(() => {
    if (integration?.credentials) {
      setCredentials(integration.credentials);
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{config.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Loader2 className="animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const handleSave = () => {
    updateMutation.mutate({
      serviceName,
      credentials,
      enabled: integration?.enabled,
    });
  };

  const handleTest = () => {
    testMutation.mutate({ serviceName });
  };

  const handleToggle = (enabled: boolean) => {
    toggleMutation.mutate({ serviceName, enabled });
  };

  const getStatusIcon = () => {
    if (!integration) return null;
    
    switch (integration.testStatus) {
      case "success":
      case "connected":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "failed":
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "not_configured":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {config.name}
              {getStatusIcon()}
            </CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </div>
          <Switch
            checked={integration?.enabled || false}
            onCheckedChange={handleToggle}
            disabled={toggleMutation.isPending}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {config.fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={`${serviceName}-${field.key}`}>{field.label}</Label>
            <Input
              id={`${serviceName}-${field.key}`}
              type={field.type === "password" && !showPasswords ? "password" : "text"}
              value={credentials[field.key] || integration?.credentials?.[field.key] || ""}
              onChange={(e) => setCredentials({ ...credentials, [field.key]: e.target.value })}
              placeholder={`Digite ${field.label}`}
            />
          </div>
        ))}
        
        {integration?.testMessage && (
          <div className="text-sm text-muted-foreground">
            <strong>Último teste:</strong> {integration.testMessage}
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={testMutation.isPending}
          >
            {testMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Testar Conexão
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowPasswords(!showPasswords)}
          >
            {showPasswords ? "Ocultar" : "Mostrar"} Senhas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminSettings() {
  const { data: integrations, isLoading } = trpc.admin.getIntegrations.useQuery();
  const initMutation = trpc.admin.initializeIntegrations.useMutation({
    onSuccess: () => {
      toast.success("Integrações inicializadas");
      trpc.useUtils().admin.getIntegrations.invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurações de Integrações</h1>
          <p className="text-muted-foreground">
            Gerencie as credenciais das integrações externas
          </p>
        </div>
        {(!integrations || integrations.length === 0) && (
          <Button onClick={() => initMutation.mutate()}>
            Inicializar Integrações
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {Object.keys(INTEGRATION_CONFIGS).map((serviceName) => (
          <IntegrationCard key={serviceName} serviceName={serviceName} />
        ))}
      </div>
    </div>
  );
}
