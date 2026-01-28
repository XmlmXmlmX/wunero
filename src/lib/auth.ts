import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import AzureADProvider from "next-auth/providers/azure-ad";
import NextAuth, { getServerSession, type NextAuthOptions } from "next-auth";
import db from "./storage";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      interface UserRow {
        id: string;
        email: string;
        password_hash: string;
      }

      const user = await db.prepare<UserRow>("SELECT id, email, password_hash FROM users WHERE email = ?").get(credentials.email);
      if (!user) return null;

      const isValid = await bcrypt.compare(credentials.password, user.password_hash);
      if (!isValid) return null;

      return { id: user.id, email: user.email };
    },
  }),
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })]
    : []),
  ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
    ? [FacebookProvider({ clientId: process.env.FACEBOOK_CLIENT_ID, clientSecret: process.env.FACEBOOK_CLIENT_SECRET })]
    : []),
  ...(process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && process.env.AZURE_AD_TENANT_ID
    ? [AzureADProvider({
        clientId: process.env.AZURE_AD_CLIENT_ID,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
        tenantId: process.env.AZURE_AD_TENANT_ID,
      })]
    : []),
];

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);

export const handlers = { GET: handler, POST: handler };

export async function auth() {
  return getServerSession(authOptions);
}
