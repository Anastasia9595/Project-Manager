import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { cn } from "@workspace/ui/lib/utils"

import { getInitials } from "@/utils/get-initials"

/** Logo bzw. Initialen eines Kunden oder Ansprechpartners. */
export function InitialsAvatar({
  name,
  logoUrl,
  size,
  contain = false,
  className,
  fallbackClassName,
}: {
  name: string
  logoUrl?: string
  size?: "default" | "sm" | "lg"
  /** Zeigt das Bild vollständig mit Rand statt zugeschnitten; für Firmenlogos. */
  contain?: boolean
  className?: string
  fallbackClassName?: string
}) {
  return (
    <Avatar size={size} className={className}>
      {logoUrl ? (
        <AvatarImage
          src={logoUrl}
          alt=""
          className={contain ? "bg-white object-contain p-1.5" : undefined}
        />
      ) : null}
      <AvatarFallback
        className={cn(
          "bg-accent text-xs font-bold text-accent-foreground",
          fallbackClassName
        )}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
