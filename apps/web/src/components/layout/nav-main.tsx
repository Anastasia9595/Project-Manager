"use client"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@workspace/ui/components/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

import type { SidebarKey } from "@/lib/auth/roles"

const ITEM_CLASSNAME =
  "hover:bg-orange-100 hover:text-orange-500 dark:hover:bg-orange-500/15 dark:hover:text-orange-400 data-active:bg-orange-100 data-active:text-orange-500 dark:data-active:bg-orange-500/15 dark:data-active:text-orange-400"

export type NavItem = {
  id: SidebarKey
  title: string
  url: string
  icon?: IconSvgElement
  items?: {
    title: string
    url: string
  }[]
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export function NavMain({
  groups,
  currentPath,
}: {
  groups: NavGroup[]
  currentPath?: string
}) {
  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) =>
              item.items?.length ? (
                <Collapsible
                  key={item.title}
                  defaultOpen={item.items.some((subItem) => subItem.url === currentPath)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger
                      render={<SidebarMenuButton tooltip={item.title} />}
                    >
                      {item.icon ? (
                        <HugeiconsIcon icon={item.icon} />
                      ) : null}
                      <span>{item.title}</span>
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        className="ml-auto transition-transform group-data-open/collapsible:rotate-90"
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              isActive={subItem.url === currentPath}
                              render={<a href={subItem.url} />}
                            >
                              <span>{subItem.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={item.url === currentPath}
                    className={ITEM_CLASSNAME}
                    render={<a href={item.url} />}
                  >
                    {item.icon ? <HugeiconsIcon icon={item.icon} /> : null}
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
