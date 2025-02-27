import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getUserByEmail } from '../../../../lib/user';
import { verifyPassword } from '../../../../lib/auth';

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials) => {
                const user = await getUserByEmail(credentials.email);

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
        newUser: null
    },
    session: {
        jwt: true
    },
    callbacks: {
        async jwt(param) {
            if (param.user) {
                param.token.id = param.user.id;
                param.token.email = param.user.email;
            }
            return param.token;
        },
        async session(session, token) {
            //session.user.id = token.id;
            //session.user.email = token.email;
            return session;
        }
    }
});

export { handler as GET, handler as POST }
