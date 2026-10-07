import { Call02Icon, Mail01Icon } from "@hugeicons/core-free-icons"

import type { CustomerBranch } from "@/models/customer-contact"
import { Card } from "@/components/shared/card"
import { InfoRow } from "./info-row"

export function BranchesCard({
  branches,
  title,
  subtitle,
}: {
  branches: CustomerBranch[]
  title: string
  subtitle: string
}) {
  return (
    <Card>
      <div className="p-6">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <ul>
        {branches.map((branch) => (
          <li
            key={branch.id}
            className="flex flex-col gap-3 border-t border-border p-6"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">
                {branch.name}
              </p>
              <p className="text-xs text-muted-foreground">{branch.address}</p>
            </div>
            <ul className="flex flex-col gap-3">
              <InfoRow icon={Call02Icon}>{branch.phone}</InfoRow>
              <InfoRow icon={Mail01Icon}>{branch.email}</InfoRow>
            </ul>
          </li>
        ))}
      </ul>
    </Card>
  )
}
