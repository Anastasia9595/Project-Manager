import type { ReactNode } from "react"

import { AppSidebar } from "./app-sidebar"
import type { SessionUser } from "@/lib/auth/types"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"

export function SidebarLayout({
  children,
  locale,
  user,
  currentPath,
}: {
  children?: ReactNode
  locale?: string
  user: SessionUser
  currentPath?: string
}) {
  return (
    <SidebarProvider>
      <AppSidebar locale={locale} user={user} currentPath={currentPath} />
      <SidebarInset>
        <SidebarTrigger />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
