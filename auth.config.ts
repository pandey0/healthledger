import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Notice: No Prisma Adapter here! This makes it safe for the Edge middleware.
export const authConfig = {
  providers: [Google],
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;