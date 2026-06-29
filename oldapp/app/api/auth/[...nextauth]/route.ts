import NextAuth from "next-auth";
import "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "../../../../lib/utils";
import { getDbInstance } from "@/lib/database/db-instance";

export const authOptions = {
  debug: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (
        credentials: Partial<Record<"email" | "password", unknown>>,
        req: Request
      ) => {
        const db = await getDbInstance();
        try {
          const email = credentials?.email as string;
          const password = credentials?.password as string;
          const user = await db.getUserByEmail(email);
          const tenancies = await db.getTenanciesByUser(email);

          if (
            user &&
            tenancies.length > 0 &&
            (await verifyPassword(password, user.PASSWORD_HASH))
          ) {
            // TODO get previous tenancy from localestorage or cookie?
            db.setTenancy(tenancies[0].ID);
            return {
              id: user.ID,
              email: user.EMAIL,
              firstName: user.FIRST_NAME,
              lastName: user.LAST_NAME,
              tenancyId: tenancies[0].ID || null,
            } as any;
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
      if (trigger === "update" && session && session.tenancyId) {
        token.tenancyId = session.tenancyId;
      }
      if (user) {
        token.id = user.USER_ID || user.id;
        token.firstName = user.FIRST_NAME || user.firstName;
        token.lastName = user.LAST_NAME || user.lastName;
        token.email = user.EMAIL || user.email;
        token.tenancyId = user.tenancyId || null;
      }
      // Always return all fields, even if user is not present (refresh)
      token.id = token.id || null;
      token.firstName = token.firstName || "";
      token.lastName = token.lastName || "";
      token.email = token.email || "";
      token.tenancyId = token.tenancyId || null;
      return token;
    },
    session: async ({ session, token, user }: any) => {
      if (!!session.user) {
        session.user = {
          ...session.user,
          userId: token.id,
          name: `${token.firstName} ${token.lastName}`,
          email: token.email as string,
          tenancyId: token.tenancyId as number,
        };
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
