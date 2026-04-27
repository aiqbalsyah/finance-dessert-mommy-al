"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type StepStatus = "completed" | "warning" | "error" | "pending"
type DotColor = "green" | "red" | "gray"

interface PipelineStep {
  name: string
  description: string
  status: StepStatus
  latency?: string
  dotColor?: DotColor
}

interface PipelineMetric {
  label: string
  value: string
  sublabel: string
}

interface PipelineCardProps {
  title: string
  description?: string
  metrics?: PipelineMetric[]
  steps: PipelineStep[]
  outputTargets?: string[]
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Status color maps (Figma exact)                                    */
/* ------------------------------------------------------------------ */

const avatarStyles: Record<StepStatus, { bg: string; border: string; text: string; line: string }> = {
  completed: {
    bg: "bg-pipeline-completed-bg",
    border: "border-pipeline-completed-border",
    text: "text-pipeline-completed-text",
    line: "border-pipeline-completed-line",
  },
  warning: {
    bg: "bg-pipeline-warning-bg",
    border: "border-pipeline-warning-border",
    text: "text-pipeline-warning-text",
    line: "border-pipeline-warning-line",
  },
  error: {
    bg: "bg-pipeline-error-bg",
    border: "border-pipeline-error-border",
    text: "text-pipeline-error-text",
    line: "border-pipeline-error-line",
  },
  pending: {
    bg: "bg-pipeline-pending-bg",
    border: "border-pipeline-pending-border",
    text: "text-pipeline-pending-text",
    line: "border-pipeline-pending-line",
  },
}

const dotColors: Record<DotColor, string> = {
  green: "bg-pipeline-dot-success",
  red: "bg-pipeline-dot-error",
  gray: "bg-pipeline-dot-pending",
}

function defaultDotColor(status: StepStatus): DotColor {
  if (status === "error") return "red"
  if (status === "pending") return "gray"
  return "green"
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function MetricsRow({ metrics }: { metrics: PipelineMetric[] }) {
  return (
    <div className="grid grid-cols-3 gap-4 border-b p-4 md:gap-6 md:p-6">
      {metrics.map((m) => (
        <div key={m.label} className="flex flex-col gap-3">
          <span className="text-muted-foreground text-xs font-semibold">{m.label}</span>
          <span className="text-2xl leading-none font-semibold tracking-tight md:text-3xl">{m.value}</span>
          <span className="text-muted-foreground text-xs">{m.sublabel}</span>
        </div>
      ))}
    </div>
  )
}

function StepAvatar({ index, status }: { index: number; status: StepStatus }) {
  const s = avatarStyles[status]
  return (
    <div
      className={cn(
        "mt-3 flex size-10 shrink-0 items-center justify-center rounded-full border",
        s.bg,
        s.border,
        s.text,
      )}
    >
      <span className="text-xl leading-tight font-semibold">{index + 1}</span>
    </div>
  )
}

function StepRow({ step, index, isLast }: { step: PipelineStep; index: number; isLast: boolean }) {
  const s = avatarStyles[step.status]
  const dot = dotColors[step.dotColor ?? defaultDotColor(step.status)]
  const isWarningOrError = step.status === "warning" || step.status === "error"

  return (
    <div className="relative flex gap-1 px-4 py-2 md:px-6 md:py-3">
      {/* Dashed connector line */}
      {!isLast && (
        <div className={cn("absolute top-[68px] left-11 z-0 h-[calc(100%-24px)] border-l border-dashed", s.line)} />
      )}

      {/* Avatar */}
      <div className="relative z-10">
        <StepAvatar index={index} status={step.status} />
      </div>

      {/* Content card */}
      <div className={cn("hover:bg-highlight flex flex-1 items-center gap-3 rounded-lg px-4 py-2 transition-colors")}>
        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-base font-semibold">{step.name}</span>
          <span className="text-muted-foreground text-sm">{step.description}</span>
        </div>

        {/* Status area */}
        <div className="flex w-24 shrink-0 items-center justify-end gap-1">
          {step.latency && (
            <span
              className={cn(
                "text-sm font-semibold",
                isWarningOrError ? avatarStyles[step.status].text : "text-muted-foreground",
              )}
            >
              {step.latency}
            </span>
          )}
          <div className={cn("size-pipeline-dot shrink-0 rounded-full", dot)} />
        </div>
      </div>
    </div>
  )
}

function OutputTargets({ targets }: { targets: string[] }) {
  return (
    <div className="flex flex-col gap-2 border-t p-4 md:p-6">
      <span className="text-base font-semibold">Output Targets</span>
      <div className="flex flex-wrap gap-2">
        {targets.map((t) => (
          <span key={t} className="bg-muted text-muted-foreground rounded-lg px-2 py-0.5 text-xs font-semibold">
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function PipelineCard({ title, description, metrics, steps, outputTargets, className }: PipelineCardProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Section title — outside card */}
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-lg font-semibold md:text-2xl">{title}</h3>
        {description && <p className="text-muted-foreground text-sm md:text-base">{description}</p>}
      </div>

      {/* Card body */}
      <Card className="rounded-card py-0 shadow-none">
        {/* Optional metrics */}
        {metrics && metrics.length > 0 && <MetricsRow metrics={metrics} />}

        {/* Steps timeline */}
        <div className="flex flex-col">
          {steps.map((step, i) => (
            <StepRow key={step.name} step={step} index={i} isLast={i === steps.length - 1} />
          ))}
        </div>

        {/* Optional output targets */}
        {outputTargets && outputTargets.length > 0 && <OutputTargets targets={outputTargets} />}
      </Card>
    </div>
  )
}

export type { PipelineStep, PipelineMetric, PipelineCardProps }
