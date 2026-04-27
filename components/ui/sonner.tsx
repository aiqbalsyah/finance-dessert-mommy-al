"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { Icon } from "@/components/shared/icon"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <Icon name="info" size={20} />,
        info: <Icon name="info" size={20} />,
        warning: <Icon name="info" size={20} />,
        error: <Icon name="info" size={20} />,
        loading: (
          <Icon name="progress_activity" size={20} className="animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--card-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "var(--card)",
          "--success-text": "var(--card-foreground)",
          "--success-border": "var(--border)",
          "--error-bg": "var(--card)",
          "--error-text": "var(--card-foreground)",
          "--error-border": "var(--border)",
          "--warning-bg": "var(--card)",
          "--warning-text": "var(--card-foreground)",
          "--warning-border": "var(--border)",
          "--info-bg": "var(--card)",
          "--info-text": "var(--card-foreground)",
          "--info-border": "var(--border)",
          "--width": "553px",
          "--border-radius": "10px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "!p-4 !gap-2 !shadow-sm",
          title: "!text-sm !font-semibold",
          description: "!text-sm !text-[#737373] dark:!text-muted-foreground",
          actionButton:
            "!bg-button-primary !text-button-primary-foreground !border-0 !rounded-lg !px-4 !py-2 !text-sm !font-normal !h-auto",
          cancelButton:
            "!bg-secondary !text-foreground !border-0 !rounded-lg !px-4 !py-2 !text-sm !font-normal !h-auto",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
