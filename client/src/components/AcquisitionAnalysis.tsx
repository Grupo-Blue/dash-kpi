import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, MousePointerClick, Calendar, Smartphone, ExternalLink } from "lucide-react";

interface AcquisitionData {
  firstTouch: {
    date: Date | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    utmContent: string | null;
    utmTerm: string | null;
    landingPage: string | null;
    referrer: string | null;
    device: string | null;
  };
  lastTouch: {
    date: Date | null;
    page: string | null;
    action: string | null;
  };
}

interface AcquisitionAnalysisProps {
  data: AcquisitionData;
}

export default function AcquisitionAnalysis({ data }: AcquisitionAnalysisProps) {
  const { firstTouch, lastTouch } = data;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Primeira Interação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5" />
            Primeira Interação (First Touch)
          </CardTitle>
          <CardDescription>
            Como o lead chegou até você
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Data */}
          {firstTouch.date && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Data</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">
                  {new Date(firstTouch.date).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          )}

          {/* UTMs */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Parâmetros UTM</p>
            <div className="grid grid-cols-2 gap-2">
              {firstTouch.utmSource && (
                <div>
                  <p className="text-xs text-muted-foreground">Source</p>
                  <Badge variant="secondary" className="mt-1">{firstTouch.utmSource}</Badge>
                </div>
              )}
              {firstTouch.utmMedium && (
                <div>
                  <p className="text-xs text-muted-foreground">Medium</p>
                  <Badge variant="secondary" className="mt-1">{firstTouch.utmMedium}</Badge>
                </div>
              )}
              {firstTouch.utmCampaign && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Campaign</p>
                  <Badge variant="secondary" className="mt-1">{firstTouch.utmCampaign}</Badge>
                </div>
              )}
              {firstTouch.utmContent && (
                <div>
                  <p className="text-xs text-muted-foreground">Content</p>
                  <Badge variant="secondary" className="mt-1">{firstTouch.utmContent}</Badge>
                </div>
              )}
              {firstTouch.utmTerm && (
                <div>
                  <p className="text-xs text-muted-foreground">Term</p>
                  <Badge variant="secondary" className="mt-1">{firstTouch.utmTerm}</Badge>
                </div>
              )}
            </div>
            {!firstTouch.utmSource && !firstTouch.utmMedium && !firstTouch.utmCampaign && (
              <p className="text-sm text-muted-foreground italic">Nenhum parâmetro UTM capturado</p>
            )}
          </div>

          {/* Landing Page */}
          {firstTouch.landingPage && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Landing Page</p>
              <a
                href={firstTouch.landingPage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {firstTouch.landingPage.length > 50 
                  ? firstTouch.landingPage.substring(0, 50) + '...' 
                  : firstTouch.landingPage}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Referrer */}
          {firstTouch.referrer && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Referrer</p>
              <p className="text-sm font-medium">{firstTouch.referrer}</p>
            </div>
          )}

          {/* Device */}
          {firstTouch.device && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Dispositivo</p>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium capitalize">{firstTouch.device}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Última Interação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MousePointerClick className="h-5 w-5" />
            Última Interação (Last Touch)
          </CardTitle>
          <CardDescription>
            Última atividade registrada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Data */}
          {lastTouch.date && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Data</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">
                  {new Date(lastTouch.date).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Ação */}
          {lastTouch.action && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ação</p>
              <Badge variant="default">{lastTouch.action}</Badge>
            </div>
          )}

          {/* Página */}
          {lastTouch.page && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Página</p>
              <a
                href={lastTouch.page}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {lastTouch.page.length > 50 
                  ? lastTouch.page.substring(0, 50) + '...' 
                  : lastTouch.page}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {!lastTouch.date && (
            <p className="text-sm text-muted-foreground italic">Nenhuma interação recente registrada</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
