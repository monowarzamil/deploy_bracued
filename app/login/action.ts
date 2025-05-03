"use server";
import { signIn } from "@/auth";
import { db } from "@/lib/prisma";
import {
  signInFormSchema,
  TSignInFormSchema,
} from "@/lib/zod-validation/auth-schema";
import { AuthError } from "next-auth";

export async function LogInAction(values: TSignInFormSchema) {
  try {
    const validation = signInFormSchema.safeParse(values);

    if (!validation.success) {
      return { error: "Invalid values! Please check your inputs!" };
    }
    const { email, password } = validation.data;

    await db.profile.findUnique({
      where: { email },
    });

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });

    return { success: "Log in successful." };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CallbackRouteError":
          return { error: "Something went wrong!" };
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }
    throw error;
  }
}
