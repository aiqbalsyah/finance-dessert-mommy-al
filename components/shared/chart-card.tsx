"use client"

import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart"

interface ChartCardProps {
  title: string
  description?: string
  config: ChartConfig
  chartClassName?: string
  className?: string
  children: React.ComponentProps<typeof ChartContainer>["children"]
}

export function ChartCard({
  title,
  description,
  config,
  chartClassName,
  className,
  children,
}: ChartCardProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-lg font-semibold md:text-2xl">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground md:text-base">{description}</p>
        )}
      </div>
      <Card className="rounded-lg p-4 shadow-none">
        <ChartContainer
          config={config}
          className={cn("aspect-auto h-chart w-full", chartClassName)}
        >
          {children}
        </ChartContainer>
      </Card>
    </div>
  )
}

export type { ChartConfig }
