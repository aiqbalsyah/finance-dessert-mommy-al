"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  ActivityLogItem                                                     */
/* ------------------------------------------------------------------ */

interface ActivityLogItemProps {
  /** Leading element — typically a 40px avatar circle with icon. */
  avatar?: React.ReactNode
  /** Bold title text. */
  title: string
  /** Muted description below title. */
  description?: string
  /** Trailing badge element — e.g. "Review" badge. */
  badge?: React.ReactNode
  /** Timestamp string — e.g. "21s ago", "2 hours ago". */
  timestamp: string
  /** Click handler — makes item interactive with cursor pointer. */
  onClick?: () => void
  className?: string
}

export function ActivityLogItem({
  avatar,
  title,
  description,
  badge,
  timestamp,
  onClick,
  className,
}: ActivityLogItemProps) {
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
        "flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 transition-colors hover:bg-highlight md:px-6 md:py-4",
        isClickable && "cursor-pointer",
        className
      )}
    >
      {avatar}

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-semibold md:text-base">{title}</span>
        {description && (
          <span className="text-sm text-muted-foreground">{description}</span>
        )}
      </div>

      {badge && <div className="flex shrink-0 items-center">{badge}</div>}

      <span className="w-24 shrink-0 text-right text-sm font-semibold text-muted-foreground">
        {timestamp}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  ActivityLogCard                                                     */
/* ------------------------------------------------------------------ */

interface ActivityLogCardProps {
  /** Section heading (28px Roboto Condensed). */
  title: string
  /** Subtitle below heading (12px, muted). */
  description?: string
  /** ActivityLogItem components or custom children. */
  children: React.ReactNode
  className?: string
}

export function ActivityLogCard({
  title,
  description,
  children,
  className,
}: ActivityLogCardProps) {
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
      <Card className="rounded-card py-0 shadow-none">
        <div className="flex flex-col">{children}</div>
      </Card>
    </div>
  )
}

export type { ActivityLogCardProps, ActivityLogItemProps }
