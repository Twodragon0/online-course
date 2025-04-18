import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

// Log auth configuration in development
if (process.env.NODE_ENV === "development") {
  console.log("Auth Configuration:");
  console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
  console.log("Google OAuth configured:", !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET);
}

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, metadata) {
      console.error(`Auth Error: ${code}`, metadata);
    },
    warn(code) {
      console.warn(`Auth Warning: ${code}`);
    },
  },
});

export { handler as GET, handler as POST };