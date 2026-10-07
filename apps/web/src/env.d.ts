/* eslint-disable-next-line @typescript-eslint/triple-slash-reference -- Astro requires this exact reference form to type Astro.locals */
/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    user: import("./lib/auth/types").SessionUser | null
  }
}
