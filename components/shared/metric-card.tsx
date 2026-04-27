"use client"

import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Icon } from "@/components/shared/icon"

interface MetricCardProps {
  title: string
  value: string
  icon?: string
  trend?: {
    value: string
    direction: "up" | "down"
  }
  className?: string
}

export function MetricCard({ title, value, icon, trend, className }: MetricCardProps) {
  return (
    <Card className={cn("rounded-card gap-3 p-4 shadow-none", className)}>
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <span className="text-muted-foreground text-xs">{title}</span>
          <span className="text-xl leading-none font-semibold tracking-tight md:text-2xl">{value}</span>
        </div>
        {icon && <Icon name={icon} size={24} className="text-muted-foreground shrink-0" />}
      </div>
      {trend && (
        <div className="flex items-center gap-1">
          <Icon
            name={trend.direction === "up" ? "trending_up" : "trending_down"}
            size={16}
            className={trend.direction === "up" ? "text-trend-positive" : "text-trend-negative"}
          />
          <span className={cn("text-xs", trend.direction === "up" ? "text-trend-positive" : "text-trend-negative")}>
            {trend.value}
          </span>
        </div>
      )}
    </Card>
  )
}
