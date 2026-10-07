import { Separator } from "@workspace/ui/components/separator"

import { Card } from "@/components/shared/card"
import { getDictionary } from "@/i18n"
import { getProfileAvatarUrl } from "@/lib/profile-fields"
import type { Profile } from "@/models/profile"
import { getFullName } from "@/utils/full-name"
import { NotificationSettingsSection } from "./notification-settings-section"
import { PasswordSection } from "./password-section"
import { ProfileAvatarHeader } from "./profile-avatar-header"
import { ProfileForm } from "./profile-form"

export function ProfileSettingsPage({
  profile,
  locale,
}: {
  profile: Profile
  locale?: string
}) {
  const t = getDictionary(locale).settingsPage
  const { avatarId, ...values } = profile
  const name = getFullName(values.firstName, values.lastName)

  return (
    <Card className="flex flex-col gap-10 p-8">
      <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
      <ProfileAvatarHeader
        name={name || values.email}
        avatarUrl={avatarId ? getProfileAvatarUrl(avatarId) : undefined}
        hint={t.avatarHint}
        uploadLabel={t.uploadNew}
      />
      <Separator />
      <ProfileForm initialValues={values} t={t} />
      <Separator />
      <NotificationSettingsSection t={t.notifications} />
      <Separator />
      <PasswordSection t={t} />
    </Card>
  )
}
