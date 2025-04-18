import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { prisma } from "@/lib/db";

// Log auth configuration in development
if (process.env.NODE_ENV === "development") {
  console.log("Auth Configuration:");
  console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
  console.log("Google OAuth configured:", !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET);
}

// Check all required environment variables
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
  }
}

const handler = NextAuth({
  // Disable adapter completely - use JWT only mode
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // Use JWT strategy exclusively
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!;
        
        // You can add additional user information here if needed
        // session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.id = user.id;
        // You can add additional claims here if needed
        // token.role = user.role;
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