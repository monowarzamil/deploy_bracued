import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import bcrypt from "bcryptjs";
import { signInFormSchema } from "./lib/zod-validation/auth-schema";
import { db } from "./lib/prisma";

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validation = signInFormSchema.safeParse(credentials);
        if (validation.success) {
          const { email, password } = validation.data;
          const user = await db.profile.findFirst({
            where: { email },
          });
          if (!user) return null;
          const matchPassword = await bcrypt.compare(password, user.password);
          if (matchPassword) return user;
        }
        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
