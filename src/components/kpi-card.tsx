import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

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
}

export function KpiCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  className, 
  accent,
  isLoading = false 
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

  return (
    <Card className={cn("overflow-hidden glass-card kpi-card-anim", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className={cn("text-2xl font-bold tracking-tight", accent && "text-accent")}>
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
              <span className={cn("text-xs font-medium", trend.positive ? "text-emerald-400" : "text-rose-400")}>
                {trend.positive ? "+" : "-"}{trend.value}%
              </span>
            )}
            <span className="text-xs text-muted-foreground">{description}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
