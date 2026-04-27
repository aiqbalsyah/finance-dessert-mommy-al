"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Icon } from "@/components/shared/icon"

interface InsightCardProps {
  badge?: React.ReactNode
  title: string
  description: string
  href?: string
  className?: string
}

export function InsightCard({
  badge,
  title,
  description,
  href,
  className,
}: InsightCardProps) {
  const card = (
    <Card
      className={cn(
        "gap-3 border border-border bg-card p-4 shadow-none transition-colors hover:border-highlight-border hover:bg-highlight md:p-6",
        href && "flex-row items-center",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {badge && <div>{badge}</div>}
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold md:text-base">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {href && (
        <Icon
          name="arrow_outward"
          size={24}
          className="shrink-0 text-muted-foreground"
        />
      )}
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {card}
      </Link>
    )
  }

  return card
}
