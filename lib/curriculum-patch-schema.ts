import { z } from "zod";

export const curriculumPatchSchema = z.object({
  id: z.string().min(1).max(200),
  program: z.string().min(1).max(100).optional(),
  phaseId: z.string().max(100).optional(),
  topic: z.string().max(500).optional(),
  status: z.enum(["active", "coming-soon", "hidden"]).optional(),
  tutorNote: z.string().max(500).nullable().optional(),
  sortOrder: z.number().int().min(0).max(10000).optional(),
});

export type CurriculumPatch = z.infer<typeof curriculumPatchSchema>;
