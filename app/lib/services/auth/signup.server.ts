import bcrypt from "bcryptjs";
import { createUser, findUserByEmail } from "../../repositories/userAuthRepository.server";

export type SignupResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; errors: Partial<Record<"email" | "firstname" | "lastname" | "password" | "form", string>> };

export async function signupWithEmailPassword(args: {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
}): Promise<SignupResult> {
  const errors: Partial<Record<"email" | "firstname" | "lastname" | "password" | "form", string>> = {};

  const email = args.email.trim().toLowerCase();
  const firstname = args.firstname.trim();
  const lastname = args.lastname.trim();
  const { password } = args;

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    errors.email = "A valid email address is required.";
  }
  if (!firstname) {
    errors.firstname = "First name is required.";
  }
  if (!lastname) {
    errors.lastname = "Last name is required.";
  }
  if (!password || password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return { ok: false, errors: { email: "An account with this email already exists." } };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      email,
      passwordHash,
      name: `${firstname} ${lastname}`,
    });

    return { ok: true, userId: user.id, email: user.email };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, errors: { form: `Signup failed: ${message}` } };
  }
}
