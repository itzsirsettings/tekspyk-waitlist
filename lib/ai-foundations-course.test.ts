import { describe, it, expect } from "vitest";
import { aiFoundationsCourse } from "./ai-foundations-course";
import { learningActionSchema, scoreQuiz } from "./learning-schema";
describe("AI foundations course", () => {
  it("has valid authored assignments and answer keys across the nine phases", () => {
    expect(aiFoundationsCourse.lessons).toHaveLength(9);
    for (const lesson of aiFoundationsCourse.lessons) {
      expect(learningActionSchema.safeParse({ action: "create-lesson", classId: "00000000-0000-4000-8000-000000000001", ...lesson }).success).toBe(true);
      if (lesson.kind === "quiz") expect(scoreQuiz(lesson.questions, lesson.questions.map(q => q.correctIndex))).toBe(100);
    }
  });
});
