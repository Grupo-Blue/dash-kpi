import { LucideIcon, Inbox, Database, FileQuestion, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon: Icon = Inbox, 
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="rounded-full bg-muted p-6 mb-4">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} variant="default">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Estados vazios específicos

export function NoDataAvailable() {
  return (
    <EmptyState
      icon={Database}
      title="Nenhum dado disponível"
      description="Não há dados para exibir no momento. Tente atualizar a página ou aguarde a próxima sincronização."
    />
  );
}

export function IntegrationNotConfigured({ integrationName }: { integrationName: string }) {
  return (
    <EmptyState
      icon={Settings}
      title={`${integrationName} não configurado`}
      description={`A integração com ${integrationName} ainda não foi configurada. Configure as credenciais no painel de administração para visualizar os dados.`}
      action={{
        label: "Ir para Administração",
        onClick: () => window.location.href = '/admin'
      }}
    />
  );
}

export function NoResultsFound({ searchTerm }: { searchTerm?: string }) {
  return (
    <EmptyState
      icon={FileQuestion}
      title="Nenhum resultado encontrado"
      description={searchTerm 
        ? `Não encontramos resultados para "${searchTerm}". Tente ajustar os filtros ou termos de busca.`
        : "Não encontramos nenhum resultado. Tente ajustar os filtros."}
    />
  );
}
