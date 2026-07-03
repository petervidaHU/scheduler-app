import bcrypt from "bcryptjs";
import { selectActiveMembership } from "../../domain/auth/selectActiveMembership";
import {
  createBootstrapAuthData,
  findUserByEmailForAuth,
  getTotalUserCount,
} from "../../repositories/userAuthRepository.server";
import type { UserSessionData } from "../../auth/session.server";

export type LoginResult =
  | { ok: true; user: UserSessionData }
  | { ok: false; message: string };

async function ensureBootstrapUserIfNeeded() {
  const enabled = process.env.AUTH_BOOTSTRAP_ENABLED !== "false";
  const isProduction = process.env.NODE_ENV === "production";

  if (!enabled || isProduction) {
    return;
  }

  const totalUsers = await getTotalUserCount();
  if (totalUsers > 0) {
    return;
  }

  const bootstrapEmail = process.env.AUTH_BOOTSTRAP_EMAIL ?? "admin@example.com";
  const bootstrapPassword = process.env.AUTH_BOOTSTRAP_PASSWORD ?? "admin1234";
  const bootstrapTenancyName = process.env.AUTH_BOOTSTRAP_TENANCY_NAME ?? "Default Tenancy";
  const bootstrapTenancySlug = process.env.AUTH_BOOTSTRAP_TENANCY_SLUG ?? "default-tenancy";

  const passwordHash = await bcrypt.hash(bootstrapPassword, 10);

  await createBootstrapAuthData({
    email: bootstrapEmail,
    passwordHash,
    tenancyName: bootstrapTenancyName,
    tenancySlug: bootstrapTenancySlug,
  });
}

export async function loginWithEmailPassword(args: {
  email: string;
  password: string;
}): Promise<LoginResult> {
  try {
    await ensureBootstrapUserIfNeeded();

    const user = await findUserByEmailForAuth(args.email);
    if (!user) {
      return { ok: false, message: "Invalid email or password." };
    }

    const isValidPassword = await bcrypt.compare(args.password, user.passwordHash);
    if (!isValidPassword) {
      return { ok: false, message: "Invalid email or password." };
    }

    const activeMembership = selectActiveMembership(user.memberships);

    return {
      ok: true,
      user: {
        userId: user.id,
        email: user.email,
        tenancyId: activeMembership?.tenancyId ?? null,
        role: activeMembership?.role ?? null,
      },
    };
  } catch (error) {
    console.error("Login failed:", error);
    return { ok: false, message: "Authentication failed. Please try again." };
  }
}
