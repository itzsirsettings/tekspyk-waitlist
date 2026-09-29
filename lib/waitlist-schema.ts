import { z } from "zod";

export const waitlistSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  email: z.string().trim().email("Enter a valid email address").max(254),
  phone: z.string().trim().min(1, "Phone number is required").max(40),
  country: z.string().trim().min(1, "Country is required").max(100),
  occupation: z.string().trim().min(1, "Occupation is required").max(100),
  experienceLevel: z.string().trim().min(1, "Experience level is required").max(100),
  learningGoals: z.string().trim().min(1, "Learning goals are required").max(2000),
  referralCode: z.string().trim().max(50).optional().or(z.literal("")),
  newsletter: z.boolean().default(false),
  adultConfirmed: z.boolean().refine((value) => value, {
    message: "You must confirm that you are 18 or older",
  }),
  termsAccepted: z.boolean().refine((value) => value, {
    message: "You must accept the terms and privacy policy",
  }),
});

export type WaitlistFormValues = z.output<typeof waitlistSchema>;
export type WaitlistSubmission = z.output<typeof waitlistSchema>;
