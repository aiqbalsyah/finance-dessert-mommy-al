"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Icon } from "@/components/shared/icon"

export interface NavItem {
  title: string
  url: string
  icon?: React.ReactNode
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export function NavMain({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname()

  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            {group.label}
          </SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) =>
              item.items?.length ? (
                <Collapsible
                  key={item.title}
                  defaultOpen={item.isActive || item.items.some((sub) => pathname === sub.url)}
                  className="group/collapsible"
                  render={<SidebarMenuItem />}
                >
                  <CollapsibleTrigger
                    render={<SidebarMenuButton tooltip={item.title} />}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                    <Icon name="chevron_right" size={16} className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            isActive={pathname === subItem.url}
                            render={<Link href={subItem.url} />}
                          >
                            <span>{subItem.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url))}
                    render={<Link href={item.url} />}
                    className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:font-medium"
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            )}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}
