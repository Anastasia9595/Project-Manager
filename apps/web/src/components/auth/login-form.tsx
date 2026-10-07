import { useState, type SubmitEvent } from "react"
import { HugeiconsIcon } from "@hugeicons/react"


import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Input } from "@workspace/ui/components/input"

import { getDictionary } from "@/i18n"
import { Key01Icon, ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons"

export function LoginForm({ locale }: { locale?: string }) {
  const dict = getDictionary(locale)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember: rememberMe }),
      })

      if (response.ok) {
        window.location.href = "/"
        return
      }

      const body = (await response.json().catch(() => null)) as { error?: string } | null
      setError(
        body?.error === "invalid_credentials"
          ? dict.loginForm.invalidCredentials
          : dict.loginForm.genericError,
      )
      setIsSubmitting(false)
    } catch {
      setError(dict.loginForm.genericError)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8">
      <div className="flex justify-center">
        <div className="flex size-20 items-center justify-center rounded-3xl bg-orange-100">
          <HugeiconsIcon
            icon={Key01Icon}
            size={40}
            className="text-orange-500"
            strokeWidth={2}
          />
        </div>
      </div>

      <h1 className="mt-6 text-center text-2xl font-bold text-foreground">
       {dict.loginForm.title}
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {dict.loginForm.subtitle}
      </p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder={dict.loginForm.emailLabel}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder={dict.loginForm.passwordLabel}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? dict.loginForm.hidePassword : dict.loginForm.showPassword}
            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
          >
            <HugeiconsIcon icon={showPassword ? ViewOffIcon : ViewIcon} size={18} />
          </button>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="bg-orange-500 text-white hover:bg-orange-500/90"
        >
          {dict.loginForm.submitButton}

        </Button>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-foreground">
            <Checkbox
              checked={rememberMe}
              onCheckedChange={setRememberMe}
              className="data-checked:border-orange-500 data-checked:bg-orange-500"
            />
            {dict.loginForm.rememberAccount}
          </label>
        </div>
      </form>
    </div>
  )
}
