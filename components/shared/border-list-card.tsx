"use client"

import { Icon } from "@/components/shared/icon"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  BorderListItem                                                      */
/* ------------------------------------------------------------------ */

interface BorderListItemProps {
  /** Leading element — typically a 40px avatar circle with initials or icon. */
  avatar?: React.ReactNode
  /** Bold title text (18px Sora bold). */
  title: string
  /** Muted description below title (14px regular). */
  description?: string
  /** Trailing badge element — e.g. role badge. */
  badge?: React.ReactNode
  /** Show trailing arrow icon. Auto-enabled when onClick is provided. */
  showArrow?: boolean
  /** Click handler — makes item interactive with cursor pointer and trailing arrow. */
  onClick?: () => void
  className?: string
}

export function BorderListItem({
  avatar,
  title,
  description,
  badge,
  showArrow,
  onClick,
  className,
}: BorderListItemProps) {
  const isClickable = !!onClick
  const hasArrow = showArrow ?? isClickable

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
        "flex items-center gap-3 border-b border-border p-4 last:border-b-0 transition-colors hover:bg-highlight md:p-6",
        isClickable && "cursor-pointer",
        className
      )}
    >
      {avatar}

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-bold md:text-base">{title}</span>
        {description && (
          <span className="text-sm text-muted-foreground">{description}</span>
        )}
      </div>

      {badge && <div className="flex shrink-0 items-center">{badge}</div>}

      {hasArrow && (
        <Icon
          name="arrow_right_alt"
          size={24}
          className="shrink-0 text-muted-foreground"
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  BorderListCard                                                      */
/* ------------------------------------------------------------------ */

interface BorderListCardProps {
  /** Section heading (28px Roboto Condensed). */
  title: string
  /** Subtitle below heading (12px, muted). */
  description?: string
  /** BorderListItem components or custom children. */
  children: React.ReactNode
  className?: string
}

export function BorderListCard({
  title,
  description,
  children,
  className,
}: BorderListCardProps) {
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

export type { BorderListCardProps, BorderListItemProps }
