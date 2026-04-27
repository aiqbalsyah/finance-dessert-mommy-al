"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatusMetricCardProps {
  /** Label text above the value (12px Sora regular, muted). */
  label: string
  /** Large display value (24px Sora semibold, tight letter-spacing). */
  value: string
  /** Subtitle below the value (14px Sora bold, muted). */
  subtitle: string
  /** Optional chart/sparkline element rendered on the right (142×90px area). */
  chart?: React.ReactNode
  className?: string
}

export function StatusMetricCard({
  label,
  value,
  subtitle,
  chart,
  className,
}: StatusMetricCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-row items-center gap-3 rounded-card p-4 shadow-none",
        className
      )}
    >
      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xl font-semibold tracking-tight md:text-2xl">{value}</span>
        <span className="text-sm font-bold text-muted-foreground">
          {subtitle}
        </span>
      </div>

      {/* Chart slot */}
      {chart && (
        <div className="h-sparkline w-sparkline shrink-0">{chart}</div>
      )}
    </Card>
  )
}

export type { StatusMetricCardProps }
