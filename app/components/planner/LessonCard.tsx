import { ActionIcon, Badge, Box, Group, Stack, Text, Tooltip } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import type { PlannerEntry } from "../../lib/repositories/plannerRepository.server";

export const PX_PER_MIN = 1.5;
export const DISPLAY_START_MINUTE = 360; // 6:00 AM

interface LessonCardProps {
  entry: PlannerEntry;
  onRemove: (entryId: string) => void;
  isRemoving?: boolean;
}

export function LessonCard({ entry, onRemove, isRemoving }: LessonCardProps) {
  const { timeslot, entryId } = entry;
  const top = (timeslot.startMinute - DISPLAY_START_MINUTE) * PX_PER_MIN;
  const height = Math.max((timeslot.endMinute - timeslot.startMinute) * PX_PER_MIN, 24);

  const subjectName = timeslot.subject?.name ?? null;
  const teacherName = timeslot.teacher?.name ?? null;
  const classroomName = timeslot.classroom?.name ?? null;
  const className = timeslot.class?.name ?? null;

  return (
    <Box
      style={{
        position: "absolute",
        top,
        left: 2,
        right: 2,
        height,
        zIndex: 3,
        opacity: isRemoving ? 0.4 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <Tooltip
        disabled={height >= 60}
        label={
          <Stack gap={2}>
            {subjectName && <Text size="xs" fw={600}>{subjectName}</Text>}
            {className && <Text size="xs">Class: {className}</Text>}
            {teacherName && <Text size="xs">Teacher: {teacherName}</Text>}
            {classroomName && <Text size="xs">Room: {classroomName}</Text>}
          </Stack>
        }
        position="right"
        withArrow
      >
        <Box
          style={{
            width: "100%",
            height: "100%",
            background: "var(--mantine-color-blue-1)",
            border: "1px solid var(--mantine-color-blue-4)",
            borderRadius: 4,
            padding: "2px 6px",
            overflow: "hidden",
            cursor: "default",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >
          <Group justify="space-between" align="flex-start" wrap="nowrap" gap={4}>
            <Stack gap={0} style={{ minWidth: 0, flex: 1 }}>
              {subjectName && (
                <Text size="xs" fw={600} lineClamp={1} style={{ lineHeight: 1.2 }}>
                  {subjectName}
                </Text>
              )}
              {height >= 40 && className && (
                <Text size="xs" c="dimmed" lineClamp={1} style={{ lineHeight: 1.2 }}>
                  {className}
                </Text>
              )}
              {height >= 55 && teacherName && (
                <Text size="xs" c="dimmed" lineClamp={1} style={{ lineHeight: 1.2 }}>
                  {teacherName}
                </Text>
              )}
              {height >= 70 && classroomName && (
                <Badge size="xs" variant="outline" color="gray" mt={2}>
                  {classroomName}
                </Badge>
              )}
            </Stack>
            <ActionIcon
              size="xs"
              variant="subtle"
              color="red"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(entryId);
              }}
              disabled={isRemoving}
              aria-label="Remove lesson"
              style={{ flexShrink: 0, marginTop: 1 }}
            >
              <IconTrash size={12} />
            </ActionIcon>
          </Group>
        </Box>
      </Tooltip>
    </Box>
  );
}
