"use client"

import * as React from "react"
import { Icon } from "@/components/shared/icon"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type AnalysisStepStatus = "completed" | "in-progress" | "pending"

interface AnalysisPipelineStep {
  name: string
  description: string
  status: AnalysisStepStatus
  metrics?: string[]
  /** Expandable detail content — can be text, charts, tables, markdown, etc. */
  details?: React.ReactNode
}

interface AnalysisPipelineCardProps {
  title: string
  description?: string
  steps: AnalysisPipelineStep[]
  /** Indices of steps that start expanded. Defaults to none. */
  defaultExpanded?: number[]
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Status config (Figma exact)                                        */
/* ------------------------------------------------------------------ */

const statusBadgeConfig: Record<AnalysisStepStatus, { label: string; bg: string; text: string }> = {
  completed: { label: "Completed", bg: "bg-badge-success", text: "text-badge-success-foreground" },
  "in-progress": { label: "In Progress", bg: "bg-badge-accent", text: "text-badge-accent-foreground" },
  pending: { label: "Pending", bg: "bg-badge-secondary", text: "text-badge-secondary-foreground" },
}

const lineColors: Record<AnalysisStepStatus, string> = {
  completed: "border-analysis-avatar-active",
  "in-progress": "border-analysis-line-pending",
  pending: "border-analysis-line-pending",
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StepAvatar({ index, status }: { index: number; status: AnalysisStepStatus }) {
  if (status === "completed") {
    return (
      <div className="bg-analysis-avatar-active flex size-10 shrink-0 items-center justify-center rounded-full">
        <Icon name="check" size={20} className="text-white" />
      </div>
    )
  }

  return (
    <div className="border-analysis-avatar-border bg-muted flex size-10 shrink-0 items-center justify-center rounded-full border">
      <span className="text-muted-foreground text-xl leading-tight font-semibold">{index + 1}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: AnalysisStepStatus }) {
  const config = statusBadgeConfig[status]
  return (
    <span
      className={cn("inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold", config.bg, config.text)}
    >
      {config.label}
    </span>
  )
}

function MetricBadges({ metrics }: { metrics: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {metrics.map((metric) => (
        <span
          key={metric}
          className="rounded-card bg-pipeline-metric-bg text-pipeline-completed-text inline-flex items-center justify-center px-2 py-1 text-xs font-semibold"
        >
          {metric}
        </span>
      ))}
    </div>
  )
}

function ViewDetailsButton({ expanded, onClick }: { expanded: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-action bg-muted text-foreground hover:bg-analysis-detail-hover inline-flex shrink-0 items-center gap-1.5 px-2 py-[3px] text-xs font-semibold transition-colors"
    >
      {expanded ? "Hide Details" : "View Details"}
      <Icon name={expanded ? "expand_less" : "chevron_forward"} size={14} />
    </button>
  )
}

function StepRow({
  step,
  index,
  isLast,
  expanded,
  onToggle,
}: {
  step: AnalysisPipelineStep
  index: number
  isLast: boolean
  expanded: boolean
  onToggle: () => void
}) {
  const lineColor = lineColors[step.status]
  const hasDetails = !!step.details

  return (
    <div className="relative flex gap-1 p-4 md:p-6">
      {/* Dashed connector line */}
      {!isLast && (
        <div className={cn("absolute top-[48px] left-11 z-0 h-[calc(100%-24px)] border-l border-dashed", lineColor)} />
      )}

      {/* Avatar */}
      <div className="relative z-10">
        <StepAvatar index={index} status={step.status} />
      </div>

      {/* Content */}
      <div className="rounded-action flex flex-1 flex-col gap-3 px-4">
        {/* Header row — always visible */}
        <div className="flex items-center gap-4 md:gap-6">
          <span className="text-sm font-semibold md:text-base">{step.name}</span>
          <StatusBadge status={step.status} />
        </div>

        {/* Description — always visible */}
        <p className="text-muted-foreground line-clamp-2 text-sm">{step.description}</p>

        {/* Metrics + View Details button */}
        <div className="flex items-center gap-3">
          {step.metrics && step.metrics.length > 0 && <MetricBadges metrics={step.metrics} />}
          {hasDetails && (
            <div className="ml-auto">
              <ViewDetailsButton expanded={expanded} onClick={onToggle} />
            </div>
          )}
        </div>

        {/* Collapsible details — any ReactNode content */}
        {expanded && hasDetails && <div className="rounded-action border-border border p-4">{step.details}</div>}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function AnalysisPipelineCard({
  title,
  description,
  steps,
  defaultExpanded,
  className,
}: AnalysisPipelineCardProps) {
  const completedCount = steps.filter((s) => s.status === "completed").length

  const [expandedSet, setExpandedSet] = React.useState<Set<number>>(() => new Set(defaultExpanded ?? []))

  const toggle = (index: number) => {
    setExpandedSet((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Header — outside card */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-lg font-semibold md:text-2xl">{title}</h3>
          {description && <p className="text-muted-foreground text-sm md:text-base">{description}</p>}
        </div>
        <span className="text-muted-foreground text-xs font-semibold">
          {completedCount} of {steps.length} steps completed
        </span>
      </div>

      {/* Card body */}
      <Card className="rounded-card py-0 shadow-none">
        <div className="flex flex-col">
          {steps.map((step, i) => (
            <StepRow
              key={step.name}
              step={step}
              index={i}
              isLast={i === steps.length - 1}
              expanded={expandedSet.has(i)}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>
      </Card>
    </div>
  )
}

export type { AnalysisPipelineStep, AnalysisPipelineCardProps }
