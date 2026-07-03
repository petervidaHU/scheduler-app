import bcrypt from "bcryptjs";
import {
  commitUserSession,
  destroyUserSession,
  getOptionalUserSession,
  requireUserSession,
} from "../../app/lib/auth/session.server";
import {
  requireAuthenticatedUser,
  requireTenancyRole,
  requireTenancyUser,
} from "../../app/lib/services/auth/guards.server";
import { loginWithEmailPassword } from "../../app/lib/services/auth/login.server";
import {
  createBootstrapAuthData,
  findActiveMembership,
  findUserByEmailForAuth,
  getTotalUserCount,
} from "../../app/lib/repositories/userAuthRepository.server";
import { selectActiveMembership } from "../../app/lib/domain/auth/selectActiveMembership";

jest.mock("bcryptjs", () => ({
  __esModule: true,
  default: {
    compare: jest.fn(),
    hash: jest.fn(),
  },
}));

jest.mock("../../app/lib/repositories/userAuthRepository.server", () => ({
  findUserByEmailForAuth: jest.fn(),
  getTotalUserCount: jest.fn(),
  createBootstrapAuthData: jest.fn(),
  findActiveMembership: jest.fn(),
}));

jest.mock("../../app/lib/domain/auth/selectActiveMembership", () => ({
  selectActiveMembership: jest.fn(),
}));

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedFindUserByEmailForAuth = findUserByEmailForAuth as jest.MockedFunction<
  typeof findUserByEmailForAuth
>;
const mockedGetTotalUserCount = getTotalUserCount as jest.MockedFunction<typeof getTotalUserCount>;
const mockedCreateBootstrapAuthData = createBootstrapAuthData as jest.MockedFunction<
  typeof createBootstrapAuthData
>;
const mockedSelectActiveMembership = selectActiveMembership as jest.MockedFunction<
  typeof selectActiveMembership
>;
const mockedFindActiveMembership = findActiveMembership as jest.MockedFunction<
  typeof findActiveMembership
>;

async function getSessionCookieFromRedirect(fn: () => Promise<unknown>) {
  try {
    await fn();
    throw new Error("Expected redirect response");
  } catch (error) {
    const response = error as Response;
    return response.headers.get("Set-Cookie");
  }
}

describe("session.server", () => {
  test("getOptionalUserSession returns null without cookie", async () => {
    const result = await getOptionalUserSession(new Request("http://localhost"));
    expect(result).toBeNull();
  });

  test("commitUserSession stores session and getOptionalUserSession reads it back", async () => {
    const cookie = await getSessionCookieFromRedirect(() =>
      commitUserSession({
        request: new Request("http://localhost"),
        user: {
          userId: "u1",
          email: "admin@example.com",
          tenancyId: "t1",
          role: "ADMIN",
        },
        redirectTo: "/en/app",
      }),
    );

    expect(cookie).toContain("__scheduler_session=");

    const result = await getOptionalUserSession(
      new Request("http://localhost", {
        headers: { Cookie: cookie ?? "" },
      }),
    );

    expect(result).toEqual({
      userId: "u1",
      email: "admin@example.com",
      tenancyId: "t1",
      role: "ADMIN",
    });
  });

  test("requireUserSession redirects to locale login when missing", async () => {
    await expect(
      requireUserSession({
        request: new Request("http://localhost"),
        locale: "hu",
      }),
    ).rejects.toMatchObject({ status: 302 });
  });

  test("destroyUserSession clears cookie and redirects", async () => {
    const cookie = await getSessionCookieFromRedirect(() =>
      commitUserSession({
        request: new Request("http://localhost"),
        user: {
          userId: "u1",
          email: "admin@example.com",
          tenancyId: "t1",
          role: "ADMIN",
        },
        redirectTo: "/en/app",
      }),
    );

    try {
      await destroyUserSession({
        request: new Request("http://localhost", {
          headers: { Cookie: cookie ?? "" },
        }),
        redirectTo: "/en/login",
      });
      throw new Error("Expected redirect");
    } catch (error) {
      const response = error as Response;
      expect(response.status).toBe(302);
      expect(response.headers.get("Set-Cookie")).toContain("__scheduler_session=");
    }
  });
});

describe("auth guards", () => {
  test("requireAuthenticatedUser returns authenticated user", async () => {
    const cookie = await getSessionCookieFromRedirect(() =>
      commitUserSession({
        request: new Request("http://localhost"),
        user: {
          userId: "u1",
          email: "admin@example.com",
          tenancyId: null,
          role: null,
        },
        redirectTo: "/en/app",
      }),
    );

    const result = await requireAuthenticatedUser({
      request: new Request("http://localhost", {
        headers: { Cookie: cookie ?? "" },
      }),
      locale: "en",
    });

    expect(result.email).toBe("admin@example.com");
  });

  test("requireTenancyUser redirects to onboarding when tenancy is missing", async () => {
    const cookie = await getSessionCookieFromRedirect(() =>
      commitUserSession({
        request: new Request("http://localhost"),
        user: {
          userId: "u1",
          email: "admin@example.com",
          tenancyId: null,
          role: null,
        },
        redirectTo: "/en/app",
      }),
    );

    await expect(
      requireTenancyUser({
        request: new Request("http://localhost", {
          headers: { Cookie: cookie ?? "" },
        }),
        locale: "en",
      }),
    ).rejects.toMatchObject({ status: 302, headers: expect.objectContaining({}) });
  });

  test("requireTenancyUser redirects to switch-tenancy when membership is revoked", async () => {
    mockedFindActiveMembership.mockResolvedValue(null);

    const cookie = await getSessionCookieFromRedirect(() =>
      commitUserSession({
        request: new Request("http://localhost"),
        user: {
          userId: "u1",
          email: "admin@example.com",
          tenancyId: "t1",
          role: "OWNER",
        },
        redirectTo: "/en/app",
      }),
    );

    try {
      await requireTenancyUser({
        request: new Request("http://localhost", {
          headers: { Cookie: cookie ?? "" },
        }),
        locale: "en",
      });
      throw new Error("Expected redirect");
    } catch (error) {
      const response = error as Response;
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("/en/switch-tenancy");
    }
  });

  test("requireTenancyUser returns fresh role from DB, not the stale cookie role", async () => {
    mockedFindActiveMembership.mockResolvedValue({ role: "MEMBER" });

    const cookie = await getSessionCookieFromRedirect(() =>
      commitUserSession({
        request: new Request("http://localhost"),
        user: {
          userId: "u1",
          email: "admin@example.com",
          tenancyId: "t1",
          role: "OWNER",
        },
        redirectTo: "/en/app",
      }),
    );

    const result = await requireTenancyUser({
      request: new Request("http://localhost", {
        headers: { Cookie: cookie ?? "" },
      }),
      locale: "en",
    });

    expect(result.role).toBe("MEMBER");
    expect(mockedFindActiveMembership).toHaveBeenCalledWith({
      userId: "u1",
      tenancyId: "t1",
    });
  });

  test("requireTenancyRole throws 403 when role is not allowed", async () => {
    mockedFindActiveMembership.mockResolvedValue({ role: "MEMBER" });

    const cookie = await getSessionCookieFromRedirect(() =>
      commitUserSession({
        request: new Request("http://localhost"),
        user: {
          userId: "u1",
          email: "admin@example.com",
          tenancyId: "t1",
          role: "MEMBER",
        },
        redirectTo: "/en/app",
      }),
    );

    await expect(
      requireTenancyRole({
        request: new Request("http://localhost", {
          headers: { Cookie: cookie ?? "" },
        }),
        locale: "en",
        allowedRoles: ["OWNER", "ADMIN"],
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  test("requireTenancyRole passes through an allowed role", async () => {
    mockedFindActiveMembership.mockResolvedValue({ role: "ADMIN" });

    const cookie = await getSessionCookieFromRedirect(() =>
      commitUserSession({
        request: new Request("http://localhost"),
        user: {
          userId: "u1",
          email: "admin@example.com",
          tenancyId: "t1",
          role: "ADMIN",
        },
        redirectTo: "/en/app",
      }),
    );

    const result = await requireTenancyRole({
      request: new Request("http://localhost", {
        headers: { Cookie: cookie ?? "" },
      }),
      locale: "en",
      allowedRoles: ["OWNER", "ADMIN"],
    });

    expect(result.role).toBe("ADMIN");
  });
});

describe("login.server", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("returns invalid credentials when user does not exist", async () => {
    mockedGetTotalUserCount.mockResolvedValue(1);
    mockedFindUserByEmailForAuth.mockResolvedValue(null);

    const result = await loginWithEmailPassword({
      email: "missing@example.com",
      password: "bad",
    });

    expect(result).toEqual({ ok: false, message: "Invalid email or password." });
  });

  test("creates bootstrap auth data when no users exist in development", async () => {
    mockedGetTotalUserCount.mockResolvedValue(0);
    mockedBcrypt.hash.mockResolvedValue("hashed-password" as never);
    mockedFindUserByEmailForAuth.mockResolvedValue(null);

    await loginWithEmailPassword({
      email: "admin@example.com",
      password: "admin1234",
    });

    expect(mockedCreateBootstrapAuthData).toHaveBeenCalled();
  });

  test("returns a generic message when the repository throws", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockedGetTotalUserCount.mockResolvedValue(1);
    mockedFindUserByEmailForAuth.mockRejectedValue(
      new Error("connection refused at db:5432 user=scheduler"),
    );

    const result = await loginWithEmailPassword({
      email: "admin@example.com",
      password: "admin1234",
    });

    expect(result).toEqual({
      ok: false,
      message: "Authentication failed. Please try again.",
    });
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  test("returns session user on successful login", async () => {
    mockedGetTotalUserCount.mockResolvedValue(1);
    mockedFindUserByEmailForAuth.mockResolvedValue({
      id: "u1",
      email: "admin@example.com",
      passwordHash: "hash",
      memberships: [{ tenancyId: "t1", role: "OWNER" }],
    });
    mockedBcrypt.compare.mockResolvedValue(true as never);
    mockedSelectActiveMembership.mockReturnValue({ tenancyId: "t1", role: "OWNER" });

    const result = await loginWithEmailPassword({
      email: "admin@example.com",
      password: "admin1234",
    });

    expect(result).toEqual({
      ok: true,
      user: {
        userId: "u1",
        email: "admin@example.com",
        tenancyId: "t1",
        role: "OWNER",
      },
    });
  });
});
