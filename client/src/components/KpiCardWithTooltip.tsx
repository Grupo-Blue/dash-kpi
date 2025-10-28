import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardWithTooltipProps {
  kpi: {
    value: number | string;
    label: string;
    change?: number | string;
    trend?: "up" | "down" | "stable";
  };
  description?: string;
}

export function KpiCardWithTooltip({ kpi, description }: KpiCardWithTooltipProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardDescription>{kpi.label}</CardDescription>
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{kpi.value}</div>
        {kpi.change !== undefined && kpi.change !== '' && (
          <div className={`flex items-center gap-1 text-sm mt-2 ${
            kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
          }`}>
            {kpi.trend === 'up' && <TrendingUp className="w-4 h-4" />}
            {kpi.trend === 'down' && <TrendingDown className="w-4 h-4" />}
            <span>{typeof kpi.change === 'number' ? Math.abs(kpi.change) : kpi.change}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
