import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

export type KpiAlertLevel = 'high' | 'medium' | 'good' | 'none';

interface KpiCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    positive: boolean
  }
  className?: string
  accent?: boolean
  isLoading?: boolean
  alert?: KpiAlertLevel
}

export function KpiCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  className, 
  accent,
  isLoading = false,
  alert = 'none'
}: KpiCardProps) {
  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden glass-card", className)}>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24 card-loading" />
              <Skeleton className="h-8 w-32 card-loading" />
            </div>
            <Skeleton className="h-10 w-10 rounded-lg card-loading" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16 card-loading" />
            <Skeleton className="h-3 w-20 card-loading" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const alertClasses = {
    high: "kpi-alert-high",
    medium: "kpi-alert-medium",
    good: "kpi-alert-good",
    none: ""
  };

  const alertLabels = {
    high: "Crítico",
    medium: "Atenção",
    good: "Saudável",
    none: null
  };

  const alertBadgeVariants = {
    high: "destructive",
    medium: "secondary",
    good: "outline",
    none: "outline"
  } as const;

  return (
    <Card className={cn(
      "overflow-hidden glass-card kpi-card-anim relative", 
      alertClasses[alert],
      className
    )}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</p>
              {alert !== 'none' && (
                <span className={cn(
                  "text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm",
                  alert === 'high' ? "bg-destructive text-white" : 
                  alert === 'medium' ? "bg-amber-500 text-white" : 
                  "bg-emerald-500 text-white"
                )}>
                  {alertLabels[alert]}
                </span>
              )}
            </div>
            <h3 className={cn("text-2xl font-black tracking-tight font-mono", accent && "text-accent")}>
              {value}
            </h3>
          </div>
          <div className={cn("p-2 rounded-lg bg-secondary", accent && "bg-accent/10 text-accent")}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {description && (
          <div className="mt-4 flex items-center gap-2">
            {trend && (
              <span className={cn("text-xs font-black", trend.positive ? "text-emerald-400" : "text-rose-400")}>
                {trend.positive ? "+" : "-"}{trend.value}%
              </span>
            )}
            <span className="text-[10px] font-bold uppercase text-muted-foreground/60">{description}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
