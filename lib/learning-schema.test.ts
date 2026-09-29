import { describe, expect, it } from "vitest";
import { learningActionSchema, scoreQuiz } from "./learning-schema";

describe("objective scoring", () => {
  const questions = [
    { prompt: "Which answer is correct?", options: ["A", "B"], correctIndex: 1 },
    { prompt: "And this answer?", options: ["A", "B", "C"], correctIndex: 2 },
  ];
  it("scores on the server's answer key", () => {
    expect(scoreQuiz(questions, [1, 2])).toBe(100);
    expect(scoreQuiz(questions, [0, 2])).toBe(50);
    expect(scoreQuiz(questions, [0, 0])).toBe(0);
  });
  it("rejects incomplete, extra, and invalid answers", () => {
    for (const answers of [[], [1], [1, 2, 0], [-1, 2], [2, 2], [1.5, 2]]) expect(() => scoreQuiz(questions, answers)).toThrow();
  });
  it("rejects out of range grades and invalid answer keys", () => {
    expect(learningActionSchema.safeParse({ action: "grade", submissionId: "ec8ea139-c5c6-4a12-92d4-fc3fdb884ccc", version: 1, grade: 101, feedback: "Good work" }).success).toBe(false);
    expect(learningActionSchema.safeParse({ action: "create-lesson", classId: "ec8ea139-c5c6-4a12-92d4-fc3fdb884ccc", title: "Lesson", content: "x".repeat(100), kind: "quiz", prompt: "Choose an answer", questions: [{ prompt: "Question", options: ["A", "B"], correctIndex: 4 }] }).success).toBe(false);
  });
});
