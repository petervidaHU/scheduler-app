import { auth } from "./route";

export const getAuth = async (): Promise<UserSession> => {
    const session = await auth();
    if (!session || !session.user) {
        return {
            email: null,
            name: null,
            status: 'unauthenticated',
        };
    } else {
        const { user } = session;
        return  {
            email: user.email || null,
            name: user.name || null,
            status: !!user.email && !!user.name ? 'authenticated' : 'unauthenticated',
        };
    }
}
