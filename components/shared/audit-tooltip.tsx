"use client"

import type { ReactNode } from "react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatRelativeTime } from "@/lib/formatters"
import type { Actor } from "@/lib/repositories"

interface AuditTooltipProps {
  createdAt: number
  updatedAt: number
  createdBy?: Actor
  updatedBy?: Actor
  children: ReactNode
}

/**
 * Wraps content with a tooltip showing audit info ("Dibuat oleh X • 2 jam yang lalu",
 * plus "Diubah oleh Y • 30 menit yang lalu" when the row was edited after creation).
 *
 * If neither createdBy nor updatedBy is set (e.g. legacy rows from before
 * audit-trail was added), the tooltip is suppressed and children render as-is.
 */
export function AuditTooltip({
  createdAt,
  updatedAt,
  createdBy,
  updatedBy,
  children,
}: AuditTooltipProps) {
  if (!createdBy && !updatedBy) {
    return <>{children}</>
  }

  const wasEdited =
    updatedBy &&
    createdBy &&
    (updatedBy.userId !== createdBy.userId || updatedAt - createdAt > 60)

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="cursor-help underline decoration-dotted decoration-muted-foreground/40 underline-offset-2" />}>
        {children}
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex flex-col gap-0.5 text-xs">
          {createdBy && (
            <span>
              Dibuat oleh <span className="font-medium">{createdBy.userName}</span> •{" "}
              {formatRelativeTime(createdAt)}
            </span>
          )}
          {wasEdited && updatedBy && (
            <span>
              Diubah oleh <span className="font-medium">{updatedBy.userName}</span> •{" "}
              {formatRelativeTime(updatedAt)}
            </span>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
