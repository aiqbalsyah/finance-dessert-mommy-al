"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ActionBarProps {
  /** Number of selected items. When provided, bar only renders when > 0. */
  selectedCount?: number
  /** Left-side label. Defaults to "{count} items selected" when selectedCount is set. */
  label?: string
  /** Cancel callback. When provided, renders a built-in Cancel button. */
  onCancel?: () => void
  /** Action buttons rendered on the right side. */
  children: React.ReactNode
  className?: string
}

export function ActionBar({
  selectedCount,
  label,
  onCancel,
  children,
  className,
}: ActionBarProps) {
  if (selectedCount !== undefined && selectedCount <= 0) return null

  const displayLabel =
    label ??
    (selectedCount !== undefined
      ? `${selectedCount} ${selectedCount === 1 ? "item" : "items"} selected`
      : undefined)

  return (
    <div
      className={cn(
        "fixed bottom-0 right-0 z-50 w-[calc(100%-var(--sidebar-width))] p-4 animate-in slide-in-from-bottom-4 fade-in duration-200",
        className
      )}
    >
      <div className="flex items-center justify-between gap-8 rounded-action-bar border border-border bg-card px-6 py-4 shadow-sm">
        {/* Label */}
        {displayLabel && (
          <span className="text-base font-semibold text-muted-foreground">
            {displayLabel}
          </span>
        )}

        {/* Action buttons */}
        <div className="ml-auto flex items-center gap-3">
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

export type { ActionBarProps }
