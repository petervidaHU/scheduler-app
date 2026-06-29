import { prisma } from "../../db/prisma.server";

export type CreateTenancyResult =
  | { ok: true; tenancyId: string; tenancyName: string; role: "OWNER" }
  | { ok: false; errors: Partial<Record<"name" | "form", string>> };

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlug(base: string): Promise<string> {
  const baseSlug = toSlug(base);
  const existing = await prisma.tenancy.findUnique({
    where: { slug: baseSlug },
    select: { id: true },
  });
  if (!existing) return baseSlug;
  const suffix = Math.random().toString(16).slice(2, 6);
  return `${baseSlug}-${suffix}`;
}

export async function createTenancyForUser(args: {
  userId: string;
  tenancyName: string;
}): Promise<CreateTenancyResult> {
  const name = args.tenancyName.trim();

  if (!name) {
    return { ok: false, errors: { name: "School name is required." } };
  }
  if (name.length < 2) {
    return { ok: false, errors: { name: "School name must be at least 2 characters." } };
  }

  try {
    const slug = await generateUniqueSlug(name);

    const tenancy = await prisma.$transaction(async (tx) => {
      const created = await tx.tenancy.create({
        data: {
          name,
          slug,
          memberships: {
            create: {
              userId: args.userId,
              role: "OWNER",
              isActive: true,
            },
          },
        },
        select: { id: true, name: true },
      });
      return created;
    });

    return { ok: true, tenancyId: tenancy.id, tenancyName: tenancy.name, role: "OWNER" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, errors: { form: `Failed to create school: ${message}` } };
  }
}
