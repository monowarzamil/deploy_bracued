"use server";

import { db } from "@/lib/prisma";

import bcrypt from "bcryptjs";
import {
  signUpFormSchema,
  TSignUpFormSchema,
} from "@/lib/zod-validation/auth-schema";

export async function RegisterAction(values: TSignUpFormSchema) {
  try {
    const validation = signUpFormSchema.safeParse(values);

    if (!validation.success) {
      return { error: "Invalid values! Please check your inputs!" };
    }

    const { email, name, password, userRole } = validation.data;

    const userExist = await db.profile.findUnique({
      where: { email },
    });

    if (userExist) return { error: "Email already exist." };

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);

    await db.profile.create({
      data: {
        name,
        email,
        password: hashPassword,
        role: userRole,
      },
    });
    return { success: "Account created successfully." };
  } catch (err) {
    return { error: "Something went wrong.", err };
  }
}
