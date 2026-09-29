import { describe, it, expect } from "vitest";
import { curriculumPatchSchema } from "@/lib/curriculum-patch-schema";

describe("curriculumPatchSchema", () => {
  it("accepts a valid full payload", () => {
    const result = curriculumPatchSchema.safeParse({
      id: "plan_product-discovery",
      status: "coming-soon",
      tutorNote: "Covered in session 1",
      sortOrder: 2,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a payload with only id", () => {
    const result = curriculumPatchSchema.safeParse({ id: "plan_product-discovery" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty id", () => {
    const result = curriculumPatchSchema.safeParse({ id: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid status value", () => {
    const result = curriculumPatchSchema.safeParse({
      id: "plan_product-discovery",
      status: "deleted",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a tutorNote over 500 characters", () => {
    const result = curriculumPatchSchema.safeParse({
      id: "plan_product-discovery",
      tutorNote: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("accepts a null tutorNote", () => {
    const result = curriculumPatchSchema.safeParse({
      id: "plan_product-discovery",
      tutorNote: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts all valid status values", () => {
    for (const status of ["active", "coming-soon", "hidden"] as const) {
      const result = curriculumPatchSchema.safeParse({
        id: "plan_product-discovery",
        status,
      });
      expect(result.success).toBe(true);
    }
  });
});
