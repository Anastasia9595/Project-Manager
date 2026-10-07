import { Button } from "@workspace/ui/components/button"

import { InitialsAvatar } from "@/components/shared/initials-avatar"

export function ProfileAvatarHeader({
  name,
  avatarUrl,
  hint,
  uploadLabel,
}: {
  name: string
  avatarUrl?: string
  hint: string
  uploadLabel: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <InitialsAvatar
          name={name}
          logoUrl={avatarUrl}
          className="size-16"
          fallbackClassName="text-base"
        />
        <div>
          <p className="font-semibold text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">{hint}</p>
        </div>
      </div>
      <Button type="button" variant="outline" size="sm">
        {uploadLabel}
      </Button>
    </div>
  )
}
