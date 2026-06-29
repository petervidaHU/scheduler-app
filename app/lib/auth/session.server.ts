import {
  createCookieSessionStorage,
  redirect,
  type Session,
} from "react-router";

export type UserSessionData = {
  userId: string;
  email: string;
  tenancyId: string | null;
  role: "OWNER" | "ADMIN" | "MEMBER" | null;
};

type SessionData = {
  user: UserSessionData;
};

const sessionSecret = process.env.SESSION_SECRET ?? "dev-insecure-session-secret";

const sessionStorage = createCookieSessionStorage<SessionData>({
  cookie: {
    name: "__scheduler_session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    maxAge: 60 * 60 * 24 * 7,
  },
});

export async function getAuthSession(request: Request): Promise<Session<SessionData>> {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function getOptionalUserSession(
  request: Request,
): Promise<UserSessionData | null> {
  const session = await getAuthSession(request);
  return session.get("user") ?? null;
}

export async function requireUserSession(args: {
  request: Request;
  locale?: string;
}): Promise<UserSessionData> {
  const user = await getOptionalUserSession(args.request);

  if (!user) {
    const localePrefix = args.locale ? `/${args.locale}` : "";
    throw redirect(`${localePrefix}/login`);
  }

  return user;
}

export async function commitUserSession(args: {
  request: Request;
  user: UserSessionData;
  redirectTo: string;
}) {
  const session = await getAuthSession(args.request);
  session.set("user", args.user);

  throw redirect(args.redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export async function destroyUserSession(args: {
  request: Request;
  redirectTo: string;
}) {
  const session = await getAuthSession(args.request);

  throw redirect(args.redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
