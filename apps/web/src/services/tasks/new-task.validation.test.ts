import { describe, expect, it } from "vitest"
import {
  EMPTY_NEW_TASK_VALUES,
  isNewTaskValues,
  type NewTaskValues,
} from "./new-task.values"
import { MAX_LENGTH, validateNewTask } from "./new-task.validation"

const UUID = "00000000-0000-4000-8000-000000000001"

const valid = (): NewTaskValues => ({
  templateId: "",
  name: "Test",
  projectId: UUID,
  dueDate: "2026-12-01",
  priority: "medium",
  description: "",
})

const check = (changes: Partial<NewTaskValues>) =>
  validateNewTask({ ...valid(), ...changes })

describe("validateNewTask", () => {
  it("accepts valid values", () => {
    expect(validateNewTask(valid())).toEqual({})
  })

  it("rejects the empty form with required errors", () => {
    expect(validateNewTask(EMPTY_NEW_TASK_VALUES)).toEqual({
      name: "required",
      projectId: "required",
      dueDate: "required",
    })
  })

  it.each(["name", "projectId", "dueDate"] as const)("requires %s", (key) => {
    expect(check({ [key]: "" })[key]).toBe("required")
  })

  it("treats a whitespace-only name as required", () => {
    expect(check({ name: "   " }).name).toBe("required")
  })

  it("checks the name length at the boundary", () => {
    expect(check({ name: "a".repeat(MAX_LENGTH.name) })).toEqual({})
    expect(check({ name: "a".repeat(MAX_LENGTH.name + 1) }).name).toBe(
      "tooLong"
    )
  })

  it("checks the description length at the boundary", () => {
    expect(check({ description: "a".repeat(MAX_LENGTH.description) })).toEqual(
      {}
    )
    expect(
      check({ description: "a".repeat(MAX_LENGTH.description + 1) }).description
    ).toBe("tooLong")
  })

  it.each(["2026-02-30", "2026-1-1"])("rejects dueDate %s", (dueDate) => {
    expect(check({ dueDate }).dueDate).toBe("invalid")
  })

  it("accepts a past dueDate", () => {
    expect(check({ dueDate: "2020-01-01" })).toEqual({})
  })

  it("rejects a non-UUID projectId", () => {
    expect(check({ projectId: "abc" }).projectId).toBe("invalid")
  })

  it("rejects an unknown priority", () => {
    expect(
      check({ priority: "urgent" as NewTaskValues["priority"] }).priority
    ).toBe("invalid")
  })

  it("allows an empty templateId and rejects a non-UUID one", () => {
    expect(check({ templateId: "" })).toEqual({})
    expect(check({ templateId: UUID })).toEqual({})
    expect(check({ templateId: "x" }).templateId).toBe("invalid")
  })
})

describe("isNewTaskValues", () => {
  it("accepts valid values", () => {
    expect(isNewTaskValues(valid())).toBe(true)
  })

  it("rejects a missing field", () => {
    const rest: Partial<NewTaskValues> = valid()
    delete rest.name
    expect(isNewTaskValues(rest)).toBe(false)
  })

  it("rejects an unknown priority", () => {
    expect(isNewTaskValues({ ...valid(), priority: "x" })).toBe(false)
  })

  it("rejects null and non-objects", () => {
    expect(isNewTaskValues(null)).toBe(false)
    expect(isNewTaskValues("x")).toBe(false)
  })
})
