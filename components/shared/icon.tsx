import { cn } from "@/lib/utils"

interface IconProps {
  /** Material Symbol name (e.g., "search", "chevron_right", "dashboard") */
  name: string
  /** Icon size in pixels. Default 20. */
  size?: number
  /** Additional CSS classes for color, etc. */
  className?: string
  /** Whether to use filled variant. Default false. */
  fill?: boolean
}

export function Icon({ name, size = 20, className, fill = false }: IconProps) {
  return (
    <span
      className={cn("material-symbols-sharp shrink-0", className)}
      style={{
        fontSize: size,
        width: size,
        height: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        lineHeight: 1,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  )
}
