"use client"

import * as React from "react"

import { NavMain, type NavGroup } from "@/components/layouts/dashboard/nav-main"
import { NavUser } from "@/components/layouts/dashboard/nav-user"
import { useAuth } from "@/context/auth-provider"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"
import { Icon } from "@/components/shared/icon"

const navGroups: NavGroup[] = [
  {
    label: "Utama",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: <Icon name="dashboard" /> },
      { title: "Penjualan", url: "/penjualan", icon: <Icon name="point_of_sale" /> },
      { title: "Bahan", url: "/bahan", icon: <Icon name="inventory_2" /> },
      { title: "Gaji", url: "/gaji", icon: <Icon name="badge" /> },
      { title: "Pengeluaran", url: "/pengeluaran", icon: <Icon name="payments" /> },
      { title: "Barang Tidak Terjual", url: "/barang-tidak-terjual", icon: <Icon name="delete" /> },
    ],
  },
  {
    label: "Master",
    items: [
      { title: "Master Produk", url: "/master-produk", icon: <Icon name="cake" /> },
      { title: "Rekening", url: "/rekening", icon: <Icon name="account_balance" /> },
    ],
  },
  {
    label: "Laporan",
    items: [
      { title: "Laporan", url: "/laporan", icon: <Icon name="analytics" /> },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      { title: "Pengguna", url: "/pengaturan/pengguna", icon: <Icon name="group" /> },
    ],
  },
]

function SidebarBrand() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const brandContent = (
    <div className="flex h-full items-center gap-3 px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
      <div className="relative">
        <Image
          src="/images/logo/transparent/symbol.svg"
          alt={process.env.NEXT_PUBLIC_APP_NAME ?? "Logo"}
          width={36}
          height={36}
          className="size-9 shrink-0"
        />
      </div>
      <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
        <span className="truncate text-sm font-bold tracking-tight">{process.env.NEXT_PUBLIC_APP_NAME}</span>
        <span className="text-sidebar-foreground/50 truncate text-xs font-medium">
          {process.env.NEXT_PUBLIC_APP_TAGLINE}
        </span>
      </div>
    </div>
  )

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={<div className="cursor-default" />}>{brandContent}</TooltipTrigger>
        <TooltipContent side="right" align="center">
          <p className="font-semibold">{process.env.NEXT_PUBLIC_APP_NAME}</p>
          <p className="text-muted-foreground text-xs">{process.env.NEXT_PUBLIC_APP_TAGLINE}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return brandContent
}

function SidebarHelpFooter() {
  return (
    <div className="px-3 pb-2 group-data-[collapsible=icon]:hidden">
      <a
        href="#"
        className="text-sidebar-foreground/50 hover:text-sidebar-foreground/80 flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors"
      >
        <Icon name="help" size={14} />
        <span>Bantuan</span>
      </a>
    </div>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-sidebar-border h-16 justify-center border-b p-0 group-data-[collapsible=icon]:h-16 group-data-[collapsible=icon]:px-0">
        <SidebarBrand />
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={navGroups} />
      </SidebarContent>
      <SidebarFooter className="px-0 group-data-[collapsible=icon]:px-2">
        <SidebarHelpFooter />
        <SidebarSeparator className={"mx-0"} />
        <NavUser
          user={{
            name: user?.displayName ?? "Tamu",
            email: user?.email ?? "",
            avatar: "",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
