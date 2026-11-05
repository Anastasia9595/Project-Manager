import { describe, expect, it, vi } from "vitest"

import { safeReload } from "./safe-reload"

describe("safeReload", () => {
  it("meldet einen Ladefehler, ohne zu werfen", async () => {
    const onError = vi.fn()
    await expect(
      safeReload(() => Promise.reject(new Error("503")), onError)
    ).resolves.toBeUndefined()
    expect(onError).toHaveBeenCalledOnce()
  })

  it("meldet nichts bei Erfolg", async () => {
    const onError = vi.fn()
    await safeReload(() => Promise.resolve(), onError)
    expect(onError).not.toHaveBeenCalled()
  })
})
