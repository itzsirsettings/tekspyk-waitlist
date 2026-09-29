import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("@/lib/database", () => ({
  getDatabasePool: vi.fn(),
}));

import { getDatabasePool } from "@/lib/database";
import { getCurriculumTopicStates, upsertTopicState } from "./curriculum-store";

describe("getCurriculumTopicStates", () => {
  it("propagates a database failure instead of showing unverified availability", async () => {
    (getDatabasePool as ReturnType<typeof vi.fn>).mockReturnValue({
      query: vi.fn().mockRejectedValue(new Error("DB error")),
    });
    await expect(getCurriculumTopicStates()).rejects.toThrow("DB error");
  });

  it("returns map keyed by id when DB returns rows", async () => {
    const fakeRow = {
      id: "ai_plan_product-discovery",
      program: "ai_engineering",
      phase_id: "plan",
      topic: "Product discovery",
      status: "active",
      tutor_note: null,
      sort_order: 0,
      updated_at: new Date("2026-01-01"),
    };
    (getDatabasePool as ReturnType<typeof vi.fn>).mockReturnValue({
      query: vi.fn().mockResolvedValue({ rows: [fakeRow] }),
    });
    const result = await getCurriculumTopicStates();
    expect(result.size).toBe(1);
    expect(result.get("ai_plan_product-discovery")?.status).toBe("active");
  });
});

describe("upsertTopicState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls pool.query with correct SQL containing INSERT and ON CONFLICT", async () => {
    const fakeRow = {
      id: "ai_plan_product-discovery",
      program: "ai_engineering",
      phase_id: "plan",
      topic: "Product discovery",
      status: "coming-soon",
      tutor_note: "Covered in session 1",
      sort_order: 0,
      updated_at: new Date("2026-01-01"),
    };
    const mockQuery = vi.fn().mockResolvedValue({ rows: [fakeRow] });
    (getDatabasePool as ReturnType<typeof vi.fn>).mockReturnValue({ query: mockQuery });

    const result = await upsertTopicState("ai_plan_product-discovery", {
      status: "coming-soon",
      tutorNote: "Covered in session 1",
    });

    expect(mockQuery).toHaveBeenCalledOnce();
    const [sql] = mockQuery.mock.calls[0];
    expect(sql).toContain("INSERT INTO curriculum_topics");
    expect(sql).toContain("ON CONFLICT (id) DO UPDATE");
    expect(result.status).toBe("coming-soon");
    expect(result.tutorNote).toBe("Covered in session 1");
  });

  it("rejects with error when DB fails", async () => {
    (getDatabasePool as ReturnType<typeof vi.fn>).mockReturnValue({
      query: vi.fn().mockRejectedValue(new Error("Connection refused")),
    });
    await expect(
      upsertTopicState("test-id", { status: "active" })
    ).rejects.toThrow("Connection refused");
  });
});
