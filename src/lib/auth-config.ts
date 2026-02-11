import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: { label: "TOTP Code", type: "text", required: false },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isValid) {
            return null;
          }

          if (user.twoFactorSecret) {
            if (!credentials.totp) {
              throw new Error("TOTP_REQUIRED");
            }
            const auth = await import("authenticator");
            const isValidTOTP = auth.verifyToken(user.twoFactorSecret, credentials.totp);
            if (!isValidTOTP) {
              return null;
            }
          }

          return {
            id: user.id,
            email: user.email,
            role: user.role,
          };
        } catch (err) {
          if (err instanceof Error && err.message === "TOTP_REQUIRED") throw err;
          console.error("authorize error:", err);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sessions/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          token.id = user.id;
          token.role = user.role;
          const u = await prisma.user.findUnique({ where: { id: user.id } }) as { tokenVersion?: number } | null;
          token.tokenVersion = u?.tokenVersion ?? 0;
        }
        if (token.id && !user) {
          const u = await prisma.user.findUnique({ where: { id: token.id as string } }) as { tokenVersion?: number } | null;
          if (u != null && (token.tokenVersion as number) !== (u.tokenVersion ?? 0)) {
            return { ...token, invalid: true };
          }
        }
      } catch (e) {
        console.error("auth jwt callback error:", e);
      }
      return token;
    },
    async session({ session, token }) {
      if ((token as { invalid?: boolean }).invalid) {
        return { ...session, user: { ...session.user, id: "", email: null, role: "" } };
      }
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
