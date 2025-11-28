import { AlertCircle, RefreshCw, WifiOff, Key, Clock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorMessageProps {
  error: Error | unknown;
  onRetry?: () => void;
  title?: string;
}

export function ErrorMessage({ error, onRetry, title }: ErrorMessageProps) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Detectar tipo de erro
  const isTokenError = errorMessage.toLowerCase().includes('token') || 
                       errorMessage.toLowerCase().includes('credencial') ||
                       errorMessage.toLowerCase().includes('unauthorized') ||
                       errorMessage.toLowerCase().includes('authentication');
  
  const isNetworkError = errorMessage.toLowerCase().includes('network') ||
                         errorMessage.toLowerCase().includes('fetch') ||
                         errorMessage.toLowerCase().includes('connection');
  
  const isTimeoutError = errorMessage.toLowerCase().includes('timeout') ||
                         errorMessage.toLowerCase().includes('timed out');
  
  const isPermissionError = errorMessage.toLowerCase().includes('permission') ||
                            errorMessage.toLowerCase().includes('forbidden') ||
                            errorMessage.toLowerCase().includes('access denied');
  
  const isApiOffline = errorMessage.toLowerCase().includes('api') && 
                       (errorMessage.toLowerCase().includes('offline') || 
                        errorMessage.toLowerCase().includes('unavailable'));

  // Escolher ícone e mensagem apropriados
  let Icon = AlertCircle;
  let friendlyTitle = title || "Erro ao carregar dados";
  let friendlyMessage = errorMessage;
  let actionMessage = "Tente novamente";

  if (isTokenError) {
    Icon = Key;
    friendlyTitle = "Token ou credencial ausente/inválida";
    friendlyMessage = "A integração não está configurada ou o token expirou. Configure as credenciais no painel de administração.";
    actionMessage = "Ir para Administração";
  } else if (isApiOffline) {
    Icon = WifiOff;
    friendlyTitle = "API externa fora do ar";
    friendlyMessage = "O serviço externo está temporariamente indisponível. Tente novamente em alguns minutos.";
  } else if (isNetworkError) {
    Icon = WifiOff;
    friendlyTitle = "Erro de conexão";
    friendlyMessage = "Verifique sua conexão com a internet e tente novamente.";
  } else if (isTimeoutError) {
    Icon = Clock;
    friendlyTitle = "Tempo esgotado";
    friendlyMessage = "A requisição demorou muito para responder. O servidor pode estar sobrecarregado.";
  } else if (isPermissionError) {
    Icon = ShieldAlert;
    friendlyTitle = "Sem permissão";
    friendlyMessage = "Você não tem permissão para acessar este recurso. Entre em contato com o administrador.";
    actionMessage = null; // Não mostrar botão de retry para erros de permissão
  }

  const handleRetry = () => {
    if (isTokenError) {
      window.location.href = '/admin';
    } else if (onRetry) {
      onRetry();
    }
  };

  return (
    <Alert variant="destructive" className="my-4">
      <Icon className="h-4 w-4" />
      <AlertTitle>{friendlyTitle}</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>{friendlyMessage}</p>
        {actionMessage && (onRetry || isTokenError) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="mt-2"
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            {actionMessage}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
