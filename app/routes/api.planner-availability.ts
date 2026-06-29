import { getBookedResources } from "../lib/repositories/plannerRepository.server";
import { requireTenancyUser } from "../lib/services/auth/guards.server";

export async function loader({ request }: { request: Request }) {
  const user = await requireTenancyUser({ request });

  const url = new URL(request.url);
  const frameId = url.searchParams.get("frameId") ?? "";
  const dayOfWeek = Number(url.searchParams.get("dayOfWeek") ?? "");
  const startMinute = Number(url.searchParams.get("startMinute") ?? "");
  const endMinute = Number(url.searchParams.get("endMinute") ?? "");
  const excludeTimeslotId = url.searchParams.get("excludeTimeslotId") ?? undefined;

  if (
    !frameId ||
    !Number.isFinite(dayOfWeek) ||
    !Number.isFinite(startMinute) ||
    !Number.isFinite(endMinute) ||
    endMinute <= startMinute
  ) {
    return Response.json({ bookedTeacherIds: [], bookedClassroomIds: [] });
  }

  const result = await getBookedResources({
    tenancyId: user.tenancyId,
    frameId,
    dayOfWeek,
    startMinute,
    endMinute,
    excludeTimeslotId,
  });

  return Response.json(result);
}
