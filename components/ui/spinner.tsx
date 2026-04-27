import { cn } from "@/lib/utils"
import { Icon } from "@/components/shared/icon"

function Spinner({ className }: { className?: string }) {
  return (
    <Icon name="progress_activity" size={16} className={cn("animate-spin", className)} />
  )
}

export { Spinner }
