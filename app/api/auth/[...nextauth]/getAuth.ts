import { UserSession } from "@/types/UserTypes";
import { auth } from "./route";

export const getAuth = async (): Promise<UserSession> => {
    const session = await auth();
    if (!session || !session.user) {
        return {
            email: null,
            name: null,
            tenancyId: null,
            status: 'unauthenticated',
        };
    } else {
        const { user } = session as any;
        return  {
            email: user.email || null,
            name: user.name || null,
            tenancyId: user.tenancyId || null,
            status: !!user.email && !!user.name ? 'authenticated' : 'unauthenticated',
        };
    }
}
