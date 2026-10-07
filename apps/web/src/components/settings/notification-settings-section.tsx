import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { InformationCircleIcon } from "@hugeicons/core-free-icons"

import { Switch } from "@workspace/ui/components/switch"

import type { Dictionary } from "@/i18n"
import { SettingsSection } from "./settings-section"

type Dict = Dictionary["settingsPage"]["notifications"]

const OPTIONS = [
  { key: "newProjects", defaultChecked: true },
  { key: "newTasks", defaultChecked: true },
  { key: "updates", defaultChecked: false },
] as const

export function NotificationSettingsSection({ t }: { t: Dict }) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(OPTIONS.map((o) => [o.key, o.defaultChecked]))
  )

  return (
    <SettingsSection title={t.title} description={t.description}>
      <div className="flex flex-col gap-6">
        {OPTIONS.map(({ key }) => (
          <div
            key={key}
            className="grid grid-cols-[minmax(0,1fr)_5rem] items-center gap-4"
          >
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                {t[key]}
                <HugeiconsIcon
                  icon={InformationCircleIcon}
                  className="size-4 text-muted-foreground"
                />
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t[`${key}Description`]}
              </p>
            </div>
            <Switch
              className="justify-self-center"
              aria-label={t[key]}
              checked={enabled[key]}
              onCheckedChange={(checked) =>
                setEnabled((current) => ({ ...current, [key]: checked }))
              }
            />
          </div>
        ))}
      </div>
    </SettingsSection>
  )
}
