import NextAuth from "next-auth";
import "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "../../../../lib/utils";
import db from "@/lib/database/db-instance";

export const authOptions = {
  debug: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials: any) => {
        try{
        const user = await db.getUserByEmail(credentials.email);
        const tenancies = await db.getTenanciesByUser(credentials.email);

        // console.log("user in authorize::", user, tenancies);

        if (
          user &&
          tenancies.length > 0 &&
          (await verifyPassword(credentials.password, user.password_hash))
        ) {
          return { ...user, tenancy: tenancies[0] };
        } else {
          return null;
        }
      } catch (error) {
        console.error("Error in authorize:", error);
        return null;
      }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user",
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user, session, trigger }: any) {
      //  console.log("in jwt callback:", user);
      if (trigger === "update" && session) {
        token.tenancyId = session.tenancyId;
      }
      if (token && user) {
        // TODO mapping authorize object
        const { FIRST_NAME, LAST_NAME, USER_ID, EMAIL, tenancy } = user as any;
        token.id = USER_ID;
        token.firstName = FIRST_NAME;
        token.lastName = LAST_NAME;
        token.email = EMAIL;
        token.tenancyId = tenancy.TENANCY_ID;
      }
      return token;
    },
    async session({ session, token, user }: any) {
      console.log("in session callback:");
      if (session.user) {
        session.user.userId = token.id;
        session.user.name = `${token.firstName} ${token.lastName}`;
        session.user.email = token.email;
        session.user.tenancyId = token.tenancyId;
      }
      return session;
    },
  },
  experimental: { enableWebAuthn: true },
};

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
export const { GET, POST } = handlers;
