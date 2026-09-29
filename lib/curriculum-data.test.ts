import { describe, it, expect } from "vitest";
import { AI_PHASES, AI_DISCIPLINES } from "./curriculum-data";

describe("AI_PHASES", () => {
  it("has exactly 9 phases", () => {
    expect(AI_PHASES).toHaveLength(9);
  });

  it("each phase has at least one topic", () => {
    for (const phase of AI_PHASES) {
      expect(phase.topics.length).toBeGreaterThan(0);
    }
  });

  it("each phase has required fields", () => {
    for (const phase of AI_PHASES) {
      expect(phase.id).toBeTruthy();
      expect(phase.name).toBeTruthy();
      expect(phase.detail).toBeTruthy();
      expect(phase.iconName).toBeTruthy();
    }
  });
});

describe("AI_DISCIPLINES", () => {
  it("has exactly 16 disciplines", () => {
    expect(AI_DISCIPLINES).toHaveLength(16);
  });

  it("each discipline has title and description", () => {
    for (const discipline of AI_DISCIPLINES) {
      expect(discipline.title).toBeTruthy();
      expect(discipline.description).toBeTruthy();
    }
  });
});
