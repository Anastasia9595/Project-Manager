"use client"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { OrangeIcon} from "@hugeicons/core-free-icons"

export function TeamSwitcher({ name, plan }: { name: string; plan?: string }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="pointer-events-none">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-white">
            <HugeiconsIcon icon={OrangeIcon} className="size-4" />
          </div>
            <div className="grid flex-1 text-left text-base leading-tight">
            <span className="truncate font-bold text-base">{name}</span>
            {plan ? <span className="truncate text-sm">{plan}</span> : null}
            </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
