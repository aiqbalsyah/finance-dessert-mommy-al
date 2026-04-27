"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  TimelineListItem                                                    */
/* ------------------------------------------------------------------ */

interface TimelineListItemProps {
  /** Leading element — 40px colored circle with icon. */
  avatar: React.ReactNode
  /** Bold title text (16px). */
  title: string
  /** Muted description below title (14px). */
  description?: string
  /** Timestamp string — 96px fixed width, right-aligned. */
  timestamp?: string
  /** Optional badge element — e.g. "Warning" badge. */
  badge?: React.ReactNode
  /** Click handler — makes content box interactive. */
  onClick?: () => void
  className?: string
}

export function TimelineListItem({
  avatar,
  title,
  description,
  timestamp,
  badge,
  onClick,
  className,
}: TimelineListItemProps) {
  const isClickable = !!onClick

  return (
    <div className={cn("relative flex gap-1 px-4 py-3 md:px-6 md:py-4", className)}>
      {/* Dashed connector line — hidden on last item via CSS */}
      <div className="absolute left-[43px] top-[56px] -bottom-4 border-l border-dashed border-border" />

      {/* Avatar column */}
      <div className="relative z-10 shrink-0">{avatar}</div>

      {/* Content box */}
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
          "flex min-w-0 flex-1 items-center gap-3 rounded-lg px-4 py-2 transition-colors hover:bg-highlight",
          isClickable && "cursor-pointer"
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-sm font-semibold md:text-base">{title}</span>
          {description && (
            <span className="text-sm text-muted-foreground">{description}</span>
          )}
        </div>

        {badge && <div className="flex shrink-0 items-center">{badge}</div>}

        {timestamp && (
          <span className="w-24 shrink-0 text-right text-sm font-semibold text-muted-foreground">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  TimelineListCard                                                    */
/* ------------------------------------------------------------------ */

interface TimelineListCardProps {
  /** Section heading (28px Roboto Condensed). */
  title: string
  /** Subtitle below heading (12px, muted). */
  description?: string
  /** TimelineListItem components or custom children. */
  children: React.ReactNode
  className?: string
}

export function TimelineListCard({
  title,
  description,
  children,
  className,
}: TimelineListCardProps) {
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
        <div className="flex flex-col [&>*:last-child_.border-dashed]:hidden">
          {children}
        </div>
      </Card>
    </div>
  )
}

export type { TimelineListCardProps, TimelineListItemProps }
