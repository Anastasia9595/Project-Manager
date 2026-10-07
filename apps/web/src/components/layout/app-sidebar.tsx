import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { NavMain, type NavGroup, type NavItem } from "./nav-main"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import { getDictionary } from "@/i18n"
import { visibleSidebarKeys } from "@/lib/auth/roles"
import type { SessionUser } from "@/lib/auth/types"
import { NAV_GROUP, NAV_ITEMS, type NavGroupId } from "@/lib/navigation"
import { getProfileAvatarUrl } from "@/lib/profile-fields"

export function AppSidebar({
  locale,
  user,
  currentPath,
}: {
  locale?: string
  user: SessionUser
  currentPath?: string
}) {
  const dict = getDictionary(locale)
  const visibleKeys = visibleSidebarKeys(user.role)

  const itemsOfGroup = (group: NavGroupId): NavItem[] =>
    NAV_ITEMS.filter((item) => item.group === group && visibleKeys.includes(item.id)).map(
      ({ id, url, icon }) => ({ id, url, icon, title: dict.sidebar[id] }),
    )

  const groups: NavGroup[] = Object.values(NAV_GROUP).map((group) => ({
    label: dict.sidebar[group].toUpperCase(),
    items: itemsOfGroup(group),
  })).filter((group) => group.items.length > 0)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher name="Project Tracker" />
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={groups} currentPath={currentPath} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user.name,
            email: user.email,
            avatar: user.avatarId
              ? getProfileAvatarUrl(user.avatarId)
              : undefined,
          }}
          dict={dict}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
