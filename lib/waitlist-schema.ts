import { z } from "zod";

export const waitlistSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(1, "Phone number is required"),
  country: z.string().trim().min(1, "Country is required"),
  occupation: z.string().trim().min(1, "Occupation is required"),
  experienceLevel: z.string().trim().min(1, "Experience level is required"),
  learningGoals: z.string().trim().min(1, "Learning goals are required"),
  referralCode: z.string().trim().optional().or(z.literal("")),
  newsletter: z.boolean().default(true),
  termsAccepted: z.boolean().refine((value) => value, {
    message: "You must accept the terms and privacy policy",
  }),
});

export type WaitlistFormValues = z.output<typeof waitlistSchema>;
export type WaitlistSubmission = z.output<typeof waitlistSchema>;
