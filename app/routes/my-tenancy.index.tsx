import {
  Card,
  Group,
  List,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconCalendarWeek,
  IconCheck,
  IconClock,
  IconLayoutGrid,
  IconPointFilled,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { Link, useOutletContext } from "react-router";
import type { Route } from "./+types/my-tenancy.index";
import { requireTenancyUser } from "../lib/services/auth/guards.server";
import { getTenancyAdminEntityCountsForTenancy } from "../lib/services/tenancy/getTenancyAdminEntityCounts.server";
import { getScheduleListForTenancy } from "../lib/services/schedules/manageSchedules.server";
import { getTimeslotListForTenancy } from "../lib/services/timeslots/manageTimeslots.server";
import { PageHeader } from "~/ui";
import type { MyTenancyOutletContext } from "./my-tenancy-layout";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await requireTenancyUser({ request, locale: params.locale });

  const [countsResult, schedules, timeslots] = await Promise.all([
    getTenancyAdminEntityCountsForTenancy(user.tenancyId),
    getScheduleListForTenancy(user.tenancyId),
    getTimeslotListForTenancy(user.tenancyId),
  ]);

  return {
    tenancyName: user.tenancyName,
    counts: countsResult.counts,
    scheduleCount: schedules.length,
    timeslotCount: timeslots.length,
  };
}

function StatTile({
  icon: IconComponent,
  color,
  value,
  label,
}: {
  icon: typeof IconUsersGroup;
  color: string;
  value: number;
  label: string;
}) {
  return (
    <Paper withBorder radius="lg" p="md">
      <Group gap="sm" wrap="nowrap">
        <ThemeIcon variant="light" color={color} size="lg" radius="xl">
          <IconComponent size={18} aria-hidden />
        </ThemeIcon>
        <Stack gap={0}>
          <Text size="xl" fw={700}>
            {value}
          </Text>
          <Text size="xs" c="dimmed">
            {label}
          </Text>
        </Stack>
      </Group>
    </Paper>
  );
}

export default function MyTenancyDashboard({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { locale } = useOutletContext<MyTenancyOutletContext>();
  const { tenancyName, counts, scheduleCount, timeslotCount } = loaderData;

  const resourcesReady = counts.teacher > 0 && counts.class > 0 && counts.classroom > 0 && counts.subject > 0;
  const frameReady = counts.frame > 0;
  const timeslotReady = timeslotCount > 0;
  const scheduleReady = scheduleCount > 0;

  const steps: Array<{
    done: boolean;
    doneKey: "overview.stepResourcesDone" | "overview.stepFrameDone" | "overview.stepTimeslotDone" | "overview.stepScheduleDone";
    todoKey: "overview.stepResources" | "overview.stepFrame" | "overview.stepTimeslot" | "overview.stepSchedule";
    to: "admin" | "timeslots" | "schedules";
  }> = [
    { done: resourcesReady, doneKey: "overview.stepResourcesDone", todoKey: "overview.stepResources", to: "admin" },
    { done: frameReady, doneKey: "overview.stepFrameDone", todoKey: "overview.stepFrame", to: "admin" },
    { done: timeslotReady, doneKey: "overview.stepTimeslotDone", todoKey: "overview.stepTimeslot", to: "timeslots" },
    { done: scheduleReady, doneKey: "overview.stepScheduleDone", todoKey: "overview.stepSchedule", to: "schedules" },
  ];

  return (
    <Stack gap="lg">
      <PageHeader
        title={t("nav.dashboard")}
        description={t("overview.subtitle", { tenancyName })}
      />

      <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="md">
        <StatTile icon={IconUsersGroup} color="khaki" value={counts.teacher} label={t("overview.teachers")} />
        <StatTile icon={IconUsersGroup} color="tiffany" value={counts.class} label={t("overview.classes")} />
        <StatTile icon={IconLayoutGrid} color="gray" value={counts.frame} label={t("overview.frames")} />
        <StatTile icon={IconClock} color="gray" value={timeslotCount} label={t("overview.timeslots")} />
        <StatTile icon={IconCalendarWeek} color="cambridge" value={scheduleCount} label={t("overview.schedules")} />
      </SimpleGrid>

      <Card withBorder radius="lg" p="md">
        <Stack gap="sm">
          <Text fw={600}>{t("overview.gettingStarted")}</Text>
          <List spacing="sm" center>
            {steps.map((step) => (
              <List.Item
                key={step.todoKey}
                icon={
                  <ThemeIcon
                    color={step.done ? "tiffany" : "gray"}
                    variant="light"
                    size={22}
                    radius="xl"
                  >
                    {step.done ? <IconCheck size={14} aria-hidden /> : <IconPointFilled size={10} aria-hidden />}
                  </ThemeIcon>
                }
              >
                {step.done ? (
                  <Text size="sm" c="dimmed">
                    {t(step.doneKey)}
                  </Text>
                ) : (
                  <Text
                    size="sm"
                    component={Link}
                    to={`/${locale}/my-tenancy/${step.to}`}
                    style={{ textDecoration: "none" }}
                    c="var(--mantine-primary-color-filled)"
                    fw={500}
                  >
                    {t(step.todoKey)}
                  </Text>
                )}
              </List.Item>
            ))}
          </List>
        </Stack>
      </Card>
    </Stack>
  );
}
