import {
  getSyllabusItems,
  getSyllabusEntityOptions,
  createSyllabusItem,
  updateSyllabusItem,
  deleteSyllabusItem,
  type SyllabusItemRow,
  type SyllabusEntityOption,
} from "../../repositories/syllabusRepository.server";

export type { SyllabusItemRow, SyllabusEntityOption };

type SyllabusPageData = {
  items: SyllabusItemRow[];
  options: { subjects: SyllabusEntityOption[]; classes: SyllabusEntityOption[] };
  filters: { subjectId: string; classId: string };
};

export async function loadSyllabusPage(
  tenancyId: string,
  url: string,
): Promise<SyllabusPageData> {
  const params = new URL(url).searchParams;
  const subjectId = params.get("subjectId") ?? "";
  const classId = params.get("classId") ?? "";

  const [items, options] = await Promise.all([
    getSyllabusItems(tenancyId, {
      subjectId: subjectId || undefined,
      classId: classId || undefined,
    }),
    getSyllabusEntityOptions(tenancyId),
  ]);

  return { items, options, filters: { subjectId, classId } };
}

type MutationResult = { ok: true } | { ok: false; errors: Record<string, string> };

export async function createSyllabusEntry(
  tenancyId: string,
  formData: FormData,
): Promise<MutationResult> {
  const subjectId = String(formData.get("subjectId") ?? "").trim();
  const classId = String(formData.get("classId") ?? "").trim() || null;
  const weekRaw = String(formData.get("week") ?? "").trim();
  const topic = String(formData.get("topic") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const errors: Record<string, string> = {};
  if (!subjectId) errors.subjectId = "Subject is required.";
  const week = Number(weekRaw);
  if (!weekRaw || isNaN(week) || week < 1 || week > 52) errors.week = "Week must be 1–52.";
  if (!topic) errors.topic = "Topic is required.";

  if (Object.keys(errors).length) return { ok: false, errors };

  await createSyllabusItem({ tenancyId, subjectId, classId, week, topic, notes });
  return { ok: true };
}

export async function updateSyllabusEntry(
  tenancyId: string,
  formData: FormData,
): Promise<MutationResult> {
  const id = String(formData.get("id") ?? "").trim();
  const subjectId = String(formData.get("subjectId") ?? "").trim();
  const classId = String(formData.get("classId") ?? "").trim() || null;
  const weekRaw = String(formData.get("week") ?? "").trim();
  const topic = String(formData.get("topic") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const errors: Record<string, string> = {};
  if (!id) errors.id = "Item ID is required.";
  if (!subjectId) errors.subjectId = "Subject is required.";
  const week = Number(weekRaw);
  if (!weekRaw || isNaN(week) || week < 1 || week > 52) errors.week = "Week must be 1–52.";
  if (!topic) errors.topic = "Topic is required.";

  if (Object.keys(errors).length) return { ok: false, errors };

  await updateSyllabusItem({ id, tenancyId, subjectId, classId, week, topic, notes });
  return { ok: true };
}

export async function deleteSyllabusEntry(
  tenancyId: string,
  formData: FormData,
): Promise<MutationResult> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, errors: { id: "Item ID is required." } };
  await deleteSyllabusItem(id, tenancyId);
  return { ok: true };
}
