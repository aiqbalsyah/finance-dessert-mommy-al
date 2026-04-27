"use client"

import { Icon } from "@/components/shared/icon"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  RecentActivityItem                                                  */
/* ------------------------------------------------------------------ */

interface RecentActivityItemProps {
  /** Activity title (18px Sora bold). */
  title: string
  /** Badges row below the title — category, metrics, timestamp badges. */
  badges?: React.ReactNode
  /** Click handler — makes item interactive with cursor pointer. */
  onClick?: () => void
  className?: string
}

export function RecentActivityItem({
  title,
  badges,
  onClick,
  className,
}: RecentActivityItemProps) {
  const isClickable = !!onClick

  return (
    <div
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={cn(
        "flex items-center gap-4 border-b border-border px-4 py-3 last:border-b-0 transition-colors hover:bg-highlight md:gap-6 md:px-6 md:py-4",
        isClickable && "cursor-pointer",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="text-sm font-bold md:text-base">{title}</span>
        {badges && (
          <div className="flex flex-wrap gap-2">{badges}</div>
        )}
      </div>

      <Icon
        name="chevron_right"
        size={24}
        className="shrink-0 text-muted-foreground"
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  RecentActivityCard                                                  */
/* ------------------------------------------------------------------ */

interface RecentActivityCardProps {
  /** Section heading (28px Roboto Condensed). */
  title: string
  /** Subtitle below heading (12px, muted). */
  description?: string
  /** RecentActivityItem components or custom children. */
  children: React.ReactNode
  className?: string
}

export function RecentActivityCard({
  title,
  description,
  children,
  className,
}: RecentActivityCardProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Section header — outside card */}
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-lg font-semibold md:text-2xl">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground md:text-base">{description}</p>
        )}
      </div>

      {/* Card body */}
      <Card className="gap-0 rounded-card py-0 shadow-none">
        <div className="flex flex-col">{children}</div>
      </Card>
    </div>
  )
}

export type { RecentActivityCardProps, RecentActivityItemProps }
