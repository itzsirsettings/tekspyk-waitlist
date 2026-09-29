import { z } from "zod";

export const questionSchema = z.object({
  prompt: z.string().trim().min(5).max(1000),
  options: z.array(z.string().trim().min(1).max(500)).min(2).max(6),
  correctIndex: z.number().int().min(0).max(5),
}).refine((q) => q.correctIndex < q.options.length, "Select an existing answer");
export type QuizQuestion = z.infer<typeof questionSchema>;

export const learningActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("create-ai-course") }),
  z.object({ action: z.literal("update-lesson"), lessonId: z.string().uuid(), title: z.string().trim().min(3).max(140), content: z.string().trim().min(50).max(50000), prompt: z.string().trim().min(10).max(5000) }),
  z.object({ action: z.literal("enroll"), classId: z.string().uuid() }),
  z.object({ action: z.literal("progress"), lessonId: z.string().uuid(), completed: z.boolean() }),
  z.object({ action: z.literal("submit"), assignmentId: z.string().uuid(), body: z.string().trim().max(20000).default(""), answers: z.array(z.number().int().min(0).max(5)).max(20).default([]) }),
  z.object({ action: z.literal("grade"), submissionId: z.string().uuid(), version: z.number().int().positive(), grade: z.number().int().min(0).max(100), feedback: z.string().trim().min(5).max(5000) }),
  z.object({ action: z.literal("create-class"), title: z.string().trim().min(3).max(140), description: z.string().trim().min(10).max(2000) }),
  z.object({ action: z.literal("publish-class"), classId: z.string().uuid() }),
  z.object({ action: z.literal("create-lesson"), classId: z.string().uuid(), title: z.string().trim().min(3).max(140), content: z.string().trim().min(50).max(50000), kind: z.enum(["written", "quiz"]), prompt: z.string().trim().min(10).max(5000), questions: z.array(questionSchema).max(20).default([]) }),
]);
export type LearningAction = z.infer<typeof learningActionSchema>;

export function scoreQuiz(questions: QuizQuestion[], answers: number[]) {
  if (!questions.length || questions.length !== answers.length || answers.some((answer, i) => answer < 0 || answer >= questions[i].options.length || !Number.isInteger(answer))) {
    throw new Error("Answer every question before submitting.");
  }
  return Math.round(100 * questions.filter((q, i) => q.correctIndex === answers[i]).length / questions.length);
}
