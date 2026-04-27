"use client"

import { Icon } from "@/components/shared/icon"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

interface StateCardProps {
  /** Material Symbol icon name. Use "progress_activity" for loading spinner. */
  icon: string
  /** Icon size in px. Defaults to 32. */
  iconSize?: number
  /** Additional icon classes (e.g., color). */
  iconClassName?: string
  /** Bold heading text. */
  title?: string
  /** Muted description text below title. */
  description?: string
  /** Action slot — typically a Button. */
  action?: React.ReactNode
  className?: string
}

export function StateCard({
  icon,
  iconSize = 32,
  iconClassName,
  title,
  description,
  action,
  className,
}: StateCardProps) {
  const isSpinner = icon === "progress_activity"

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-card border border-border p-4",
        className
      )}
    >
      {isSpinner ? (
        <Spinner className={cn("text-muted-foreground", iconClassName)} />
      ) : (
        <Icon name={icon} size={iconSize} className={iconClassName} />
      )}

      {(title || description) && (
        <div className="flex flex-col items-center gap-1">
          {title && (
            <span className="text-sm font-semibold">{title}</span>
          )}
          {description && (
            <span className="text-center text-xs text-muted-foreground">
              {description}
            </span>
          )}
        </div>
      )}

      {action}
    </div>
  )
}

export type { StateCardProps }
