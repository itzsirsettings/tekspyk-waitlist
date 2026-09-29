import { describe, it, expect } from "vitest";
import { CT_THREE_MONTH, CT_SIX_MONTH, CT_ASSESSMENT, CT_GRADING } from "./computer-training-data";

describe("CT_THREE_MONTH", () => {
  it("has exactly 3 months", () => {
    expect(CT_THREE_MONTH).toHaveLength(3);
  });

  it("has exactly 12 weeks total", () => {
    const totalWeeks = CT_THREE_MONTH.reduce((sum, month) => sum + month.weeks.length, 0);
    expect(totalWeeks).toBe(12);
  });

  it("no week has an empty topics array", () => {
    for (const month of CT_THREE_MONTH) {
      for (const week of month.weeks) {
        expect(week.topics.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("CT_SIX_MONTH", () => {
  it("has exactly 6 months", () => {
    expect(CT_SIX_MONTH).toHaveLength(6);
  });

  it("has exactly 24 weeks total", () => {
    const totalWeeks = CT_SIX_MONTH.reduce((sum, month) => sum + month.weeks.length, 0);
    expect(totalWeeks).toBe(24);
  });

  it("no week has an empty topics array (except capstone week)", () => {
    for (const month of CT_SIX_MONTH) {
      for (const week of month.weeks) {
        // Week 24 (capstone) has no topics by design, only a project
        if (week.id === "6m-w24") continue;
        expect(week.topics.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("CT_ASSESSMENT", () => {
  it("percentages sum to 100", () => {
    const total = CT_ASSESSMENT.reduce((sum, row) => sum + row.percentage, 0);
    expect(total).toBe(100);
  });
});

describe("CT_GRADING", () => {
  it("has 5 grades", () => {
    expect(CT_GRADING).toHaveLength(5);
  });
});
