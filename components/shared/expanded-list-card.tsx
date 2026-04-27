"use client"

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { Card } from "@/components/ui/card"
import { Icon } from "@/components/shared/icon"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  ExpandedListItem                                                    */
/* ------------------------------------------------------------------ */

interface ExpandedListItemProps {
  /** Unique accordion identifier — required for expandable items. */
  value?: string
  /** Leading element — typically a 24px icon. */
  icon?: React.ReactNode
  /** Bold title text (18px Sora bold). */
  title: string
  /** Muted subtitle below title (14px Sora regular). */
  subtitle?: string
  /** Optional badge next to title — e.g. Warning, Resolved. */
  badge?: React.ReactNode
  /** Expandable content — if provided, item becomes an accordion. */
  children?: React.ReactNode
  /** Click handler for non-expandable items (link-style row). */
  onClick?: () => void
  className?: string
}

const triggerClasses =
  "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-highlight md:px-6 md:py-4"

function TriggerContent({
  icon,
  title,
  subtitle,
  badge,
}: Pick<ExpandedListItemProps, "icon" | "title" | "subtitle" | "badge">) {
  return (
    <>
      {icon}

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-semibold leading-normal md:text-base">{title}</span>
        {subtitle && (
          <span className="text-sm text-muted-foreground">{subtitle}</span>
        )}
      </div>

      {badge && <div className="flex shrink-0 items-center">{badge}</div>}
    </>
  )
}

export function ExpandedListItem({
  value,
  icon,
  title,
  subtitle,
  badge,
  children,
  onClick,
  className,
}: ExpandedListItemProps) {
  /* Non-expandable — plain row with onClick */
  if (!children) {
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
          triggerClasses,
          "border-b border-border last:border-b-0",
          isClickable && "cursor-pointer",
          className
        )}
      >
        <TriggerContent
          icon={icon}
          title={title}
          subtitle={subtitle}
          badge={badge}
        />
        <Icon
          name="chevron_right"
          size={24}
          className="shrink-0 text-muted-foreground"
        />
      </div>
    )
  }

  /* Expandable — accordion item */
  return (
    <AccordionPrimitive.Item
      value={value ?? title}
      className={cn(
        "border-b border-border last:border-b-0",
        className
      )}
    >
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger
          className={cn(
            triggerClasses,
            "group/expanded-trigger cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          )}
        >
          <TriggerContent
            icon={icon}
            title={title}
            subtitle={subtitle}
            badge={badge}
          />
          <Icon
            name="chevron_right"
            size={24}
            className="shrink-0 text-muted-foreground transition-transform duration-200 group-data-[panel-open]/expanded-trigger:rotate-90"
          />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>

      <AccordionPrimitive.Panel className="overflow-hidden data-open:animate-accordion-down data-closed:animate-accordion-up">
        <div className="h-(--accordion-panel-height) data-ending-style:h-0 data-starting-style:h-0">
          <div className="border-t border-border" />
          <div className="flex flex-col gap-1 px-4 py-4 text-sm text-muted-foreground md:px-6 md:py-6">
            {children}
          </div>
        </div>
      </AccordionPrimitive.Panel>
    </AccordionPrimitive.Item>
  )
}

/* ------------------------------------------------------------------ */
/*  ExpandedListCard                                                    */
/* ------------------------------------------------------------------ */

interface ExpandedListCardProps {
  /** Section heading (28px Roboto Condensed). */
  title: string
  /** Subtitle below heading (12px, muted). */
  description?: string
  /** ExpandedListItem components. */
  children: React.ReactNode
  /** Accordion values to expand by default. */
  defaultValue?: string[]
  className?: string
}

export function ExpandedListCard({
  title,
  description,
  children,
  defaultValue,
  className,
}: ExpandedListCardProps) {
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
        <AccordionPrimitive.Root
          multiple
          defaultValue={defaultValue}
          className="flex flex-col"
        >
          {children}
        </AccordionPrimitive.Root>
      </Card>
    </div>
  )
}

export type { ExpandedListCardProps, ExpandedListItemProps }
