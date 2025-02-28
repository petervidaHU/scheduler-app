import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyPassword } from '../../../../lib/auth';
import DatabaseService from '@/lib/database/db';

const database = new DatabaseService();

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials: any) => {
                // console.log('credentials in auth sign in::', credentials)
                const user = await database.getUserByEmail(credentials.email);
                console.log('user in authorize::', user)

                if (user && await verifyPassword(credentials.password, user.password_hash)) {
                    return user;
                } else {
                    return null;
                }
            }
        })
    ],
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout',
        error: '/auth/error',
        verifyRequest: '/auth/verify-request',
        newUser: '/auth/new-user'
    },
    session: {
        strategy: 'jwt'
    },
    callbacks: {
        async jwt({ token, user }) {
            if (token && user) {
                // TODO mapping authorize object
                const { FIRST_NAME, LAST_NAME, USER_ID, EMAIL } = user as any;
                token.id = USER_ID;
                token.firstName = FIRST_NAME;
                token.lastName = LAST_NAME;
                token.email = EMAIL;
            }
            return token;
        },
        async session({ session, token, user }) {
            if (session.user) {
                session.user.name = `${token.firstName} ${token.lastName}`;
                session.user.email = token.email;
            }
            return session;
        }
    }
});

export { handler as GET, handler as POST }
