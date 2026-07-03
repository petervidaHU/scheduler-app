import { Box, Group, Stack, Text, Tooltip } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { PlannerEntry } from "../../lib/repositories/plannerRepository.server";
import { EntityChip } from "~/ui";

export const PX_PER_MIN = 1.5;
export const DISPLAY_START_MINUTE = 360; // 6:00 AM

interface LessonCardProps {
  entry: PlannerEntry;
  hasConflict: boolean;
  onOpen: (entry: PlannerEntry) => void;
}

export function LessonCard({ entry, hasConflict, onOpen }: LessonCardProps) {
  const { t } = useTranslation();
  const { timeslot } = entry;
  const top = (timeslot.startMinute - DISPLAY_START_MINUTE) * PX_PER_MIN;
  const height = Math.max((timeslot.endMinute - timeslot.startMinute) * PX_PER_MIN, 24);

  const subjectName = timeslot.subject?.name ?? null;
  const teacherName = timeslot.teacher?.name ?? null;
  const classroomName = timeslot.classroom?.name ?? null;
  const className = timeslot.class?.name ?? null;

  const borderColor = hasConflict
    ? "var(--mantine-color-poppy-6)"
    : "var(--mantine-color-cambridge-filled)";

  return (
    <Box
      style={{
        position: "absolute",
        top,
        left: 2,
        right: 2,
        height,
        zIndex: 3,
        transition: "opacity 0.2s",
      }}
    >
      <Tooltip
        disabled={height >= 60}
        label={
          <Stack gap={2}>
            {subjectName && <Text size="xs" fw={600}>{subjectName}</Text>}
            {className && <Text size="xs">{t("entities.class")}: {className}</Text>}
            {teacherName && <Text size="xs">{t("entities.teacher")}: {teacherName}</Text>}
            {classroomName && <Text size="xs">{t("entities.classroom")}: {classroomName}</Text>}
            {hasConflict && (
              <Text size="xs" c="poppy.4" fw={600}>
                {t("planner.conflict")}
              </Text>
            )}
          </Stack>
        }
        position="right"
        withArrow
      >
        <Box
          component="button"
          type="button"
          data-lesson-card
          onClick={(e) => {
            e.stopPropagation();
            onOpen(entry);
          }}
          aria-label={`${t("planner.lessonDetails")}: ${subjectName ?? t("planner.noDetails")}`}
          style={{
            width: "100%",
            height: "100%",
            background: hasConflict
              ? "var(--mantine-color-poppy-light)"
              : "var(--mantine-color-cambridge-light)",
            border: `1px solid ${borderColor}`,
            borderLeft: `4px solid ${borderColor}`,
            borderRadius: 4,
            padding: "2px 6px",
            overflow: "hidden",
            cursor: "pointer",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            textAlign: "left",
            font: "inherit",
          }}
        >
          <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
            {subjectName && (
              <Text size="xs" fw={600} lineClamp={1} style={{ lineHeight: 1.2 }}>
                {subjectName}
              </Text>
            )}
            {height >= 40 && (
              <Group gap={4} wrap="wrap">
                {className && <EntityChip kind="class" label={className} size="xs" />}
                {height >= 55 && teacherName && <EntityChip kind="teacher" label={teacherName} size="xs" />}
                {height >= 70 && classroomName && <EntityChip kind="classroom" label={classroomName} size="xs" />}
              </Group>
            )}
          </Stack>
        </Box>
      </Tooltip>
    </Box>
  );
}
