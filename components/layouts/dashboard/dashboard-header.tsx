"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NotificationSheet } from "@/components/layouts/dashboard/notification-sheet"
import { Icon } from "@/components/shared/icon"
import { Kbd } from "@/components/ui/kbd"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface DashboardHeaderProps {
  title?: string
  breadcrumbs?: BreadcrumbItem[]
}

export function DashboardHeader({ title, breadcrumbs }: DashboardHeaderProps) {
  const showBreadcrumbs = breadcrumbs && breadcrumbs.length > 1

  return (
    <header className="bg-card sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-4 border-b px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-1 data-vertical:h-4 data-vertical:self-auto" />
        {showBreadcrumbs ? (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1
                return (
                  <BreadcrumbItem key={item.label}>
                    {index > 0 && <BreadcrumbSeparator />}
                    {isLast ? (
                      <BreadcrumbPage className="font-medium">{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={item.href ?? "#"}>{item.label}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        ) : (
          <h1 className="text-sm font-semibold">{title ?? breadcrumbs?.[0]?.label ?? ""}</h1>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="hidden h-8 w-56 justify-start gap-2 text-xs text-muted-foreground lg:flex"
          onClick={() => {}}
        >
          <Icon name="search" size={14} />
          <span className="flex-1 text-left">Cari...</span>
          <Kbd>⌘</Kbd>
        </Button>
        <Button variant="ghost" size="icon" className="size-8 lg:hidden" onClick={() => {}}>
          <Icon name="search" size={16} />
          <span className="sr-only">Cari</span>
        </Button>
        <NotificationSheet />
      </div>
    </header>
  )
}
