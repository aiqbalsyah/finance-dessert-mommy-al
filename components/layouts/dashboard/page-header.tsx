"use client"

import { useRouter } from "next/navigation"
import { Icon } from "@/components/shared/icon"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  showBack?: boolean
  onBack?: () => void
  className?: string
}

export function PageHeader({
  title,
  description,
  action,
  showBack = true,
  onBack,
  className,
}: PageHeaderProps) {
  const router = useRouter()

  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex items-start gap-2">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            className="mt-0.5 size-7 shrink-0"
            onClick={onBack ?? (() => router.back())}
          >
            <Icon name="arrow_back" size={16} />
            <span className="sr-only">Kembali</span>
          </Button>
        )}
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-2xl font-semibold md:text-3xl">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
