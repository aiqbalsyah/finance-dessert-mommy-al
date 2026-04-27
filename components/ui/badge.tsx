import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[8px] border border-transparent px-2 py-0.5 text-2xs font-semibold whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-badge-secondary text-badge-secondary-foreground [a]:hover:bg-badge-secondary/80",
        destructive:
          "bg-badge-destructive text-badge-destructive-foreground [a]:hover:bg-badge-destructive/80",
        success:
          "bg-badge-success text-badge-success-foreground [a]:hover:bg-badge-success/80",
        warning:
          "bg-badge-warning text-badge-warning-foreground [a]:hover:bg-badge-warning/80",
        info: "bg-badge-info text-badge-info-foreground [a]:hover:bg-badge-info/80",
        accent:
          "bg-badge-accent text-badge-accent-foreground [a]:hover:bg-badge-accent/80",
        muted:
          "bg-badge-muted text-badge-muted-foreground [a]:hover:bg-badge-muted/80",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/* ------------------------------------------------------------------ */
/*  Badge type system — Figma node 1726:6371                          */
/*  Maps semantic type + value to the correct color variant            */
/* ------------------------------------------------------------------ */

type BadgeType = "status" | "priority" | "risk" | "information"
type StatusValue = "processing" | "pending" | "completed" | "failed"
type PriorityValue = "low" | "medium" | "high" | "critical"
type RiskValue = "low" | "medium" | "high" | "critical"

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>

const typeVariantMap: Record<string, Record<string, BadgeVariant>> = {
  status: {
    processing: "secondary",
    pending: "warning",
    completed: "success",
    failed: "destructive",
  },
  priority: {
    low: "secondary",
    medium: "info",
    high: "accent",
    critical: "destructive",
  },
  risk: {
    low: "secondary",
    medium: "warning",
    high: "accent",
    critical: "destructive",
  },
}

function resolveVariant(
  type?: BadgeType,
  value?: string,
  fallback?: BadgeVariant
): BadgeVariant {
  if (type) {
    if (type === "information") return "muted"
    if (value && typeVariantMap[type]) {
      return typeVariantMap[type][value] ?? "secondary"
    }
    return "secondary"
  }
  return fallback ?? "default"
}

/* ------------------------------------------------------------------ */
/*  Props — discriminated union for type-safe type+value combos        */
/* ------------------------------------------------------------------ */

type BadgeTypeProps =
  | { type: "status"; value: StatusValue }
  | { type: "priority"; value: PriorityValue }
  | { type: "risk"; value: RiskValue }
  | { type: "information"; value?: never }
  | { type?: never; value?: never }

type BadgeProps = useRender.ComponentProps<"span"> &
  Omit<VariantProps<typeof badgeVariants>, "variant"> &
  BadgeTypeProps & {
    variant?: BadgeVariant
  }

function Badge({
  className,
  variant,
  type,
  value,
  render,
  ...props
}: BadgeProps) {
  const resolvedVariant = resolveVariant(type, value, variant)

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant: resolvedVariant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant: resolvedVariant,
    },
  })
}

export { Badge, badgeVariants }
export type { BadgeType, StatusValue, PriorityValue, RiskValue }
