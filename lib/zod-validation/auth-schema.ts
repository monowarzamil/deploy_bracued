import { z } from "zod";

export const signUpFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  userRole: z.enum(["STUDENT", "FACULTY"], {
    required_error: "Please select a user role.",
  }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

export type TSignUpFormSchema = z.infer<typeof signUpFormSchema>;

export const signInFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});
export type TSignInFormSchema = z.infer<typeof signInFormSchema>;
