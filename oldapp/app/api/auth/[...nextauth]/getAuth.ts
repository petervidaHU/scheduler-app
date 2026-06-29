import { UserSession } from "@/types/UserTypes";
import { auth } from "./route";
import { getUserRole } from "@/lib/getUserRole";

export const getAuth = async (): Promise<UserSession> => {
  const session = await auth();
  if (!session || !session.user) {
    return {
      email: null,
      name: null,
      tenancyId: null,
      userId: null,
      status: "unauthenticated",
      userRole: null,
    };
  } else {
    const { user } = session as any;
    const role = await getUserRole(user.userId, user.tenancyId);
    return {
      email: user.email || null,
      name: user.name || null,
      userId: user.userId || null,
      tenancyId: user.tenancyId || null,
      userRole: role || null,
      status: !!user.email && !!user.name ? "authenticated" : "unauthenticated",
    };
  }
};
