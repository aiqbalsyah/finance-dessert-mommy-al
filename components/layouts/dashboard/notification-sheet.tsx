"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import { notificationsData, type Notification } from "@/data/notifications"
import { Icon } from "@/components/shared/icon"
import { cn } from "@/lib/utils"

const typeConfig: Record<
  Notification["type"],
  { icon: string; className: string }
> = {
  info: { icon: "info", className: "text-accent-cool" },
  warning: { icon: "warning", className: "text-warning" },
  success: { icon: "check_circle", className: "text-success" },
  error: { icon: "cancel", className: "text-danger" },
}

export function NotificationSheet() {
  const [notifications, setNotifications] =
    useState<Notification[]>(notificationsData)

  const unreadCount = notifications.filter((n) => !n.read).length

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="relative size-8" />
        }
      >
        <Icon name="notifications" size={16} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-xs font-bold leading-none text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        <span className="sr-only">Notifikasi ({unreadCount} belum dibaca)</span>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col gap-0">
        <SheetHeader className="border-b">
          <div className="flex items-center justify-between pr-8">
            <div className="flex flex-col gap-0.5">
              <SheetTitle>Notifikasi</SheetTitle>
              <SheetDescription>
                {unreadCount > 0
                  ? `Anda memiliki ${unreadCount} notifikasi belum dibaca`
                  : "Tidak ada notifikasi baru"}
              </SheetDescription>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={markAllAsRead}
              >
                <Icon name="done_all" size={16} />
                <span className="sr-only sm:not-sr-only">Tandai dibaca</span>
              </Button>
            )}
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
              <Icon name="notifications" size={32} />
              <p className="text-sm">Belum ada notifikasi</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification, index) => {
                const config = typeConfig[notification.type]
                return (
                  <div key={notification.id}>
                    <button
                      className={cn(
                        "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                        !notification.read && "bg-muted/30"
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div
                        className={cn(
                          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted",
                          config.className
                        )}
                      >
                        <Icon name={config.icon} size={16} />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              "text-sm leading-tight",
                              !notification.read && "font-medium"
                            )}
                          >
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {notification.description}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          {notification.timestamp}
                        </p>
                      </div>
                    </button>
                    {index < notifications.length - 1 && <Separator />}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
