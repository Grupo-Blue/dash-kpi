import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardWithTooltipProps {
  kpi?: {
    value: number | string;
    label: string;
    change?: number | string;
    trend?: "up" | "down" | "stable";
  };
  title?: string;
  value?: string | number;
  description?: string;
  icon?: React.ReactNode;
  valueClassName?: string;
  tooltip?: string;
}

export function KpiCardWithTooltip({ kpi, title, value, description, icon, valueClassName, tooltip }: KpiCardWithTooltipProps) {
  // Suporte para ambos os formatos: objeto kpi ou props individuais
  const displayTitle = title || kpi?.label;
  const displayValue = value !== undefined ? value : kpi?.value;
  const displayTooltip = tooltip || description;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="text-sm font-medium">{displayTitle}</div>
        <div className="flex items-center gap-2">
          {icon}
          {displayTooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{displayTooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClassName || ''}`}>{displayValue}</div>
        {description && !tooltip && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {kpi?.change !== undefined && kpi?.change !== '' && (
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
