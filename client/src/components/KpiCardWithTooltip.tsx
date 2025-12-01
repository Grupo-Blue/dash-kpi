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
    <Card className="kpi-card group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{displayTitle}</div>
        <div className="flex items-center gap-2">
          {icon && <div className="text-primary/70 group-hover:text-primary transition-colors">{icon}</div>}
          {displayTooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground hover:text-primary cursor-help transition-colors" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-card border-border/50 shadow-xl">
                  <p className="text-sm">{displayTooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`kpi-card-value ${valueClassName || ''}`}>{displayValue}</div>
        {description && !tooltip && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
        {kpi?.change !== undefined && kpi?.change !== '' && (
          <div className={`flex items-center gap-1.5 text-sm font-medium mt-3 px-2 py-1 rounded-full w-fit ${
            kpi.trend === 'up' 
              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' 
              : kpi.trend === 'down' 
              ? 'text-red-700 bg-red-50 border border-red-200' 
              : 'text-muted-foreground bg-muted/50'
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
