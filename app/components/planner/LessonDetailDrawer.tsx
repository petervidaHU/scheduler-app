import { useState } from "react";
import { Alert, Button, Drawer, Group, Stack, Text, Title } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { PlannerEntry } from "../../lib/repositories/plannerRepository.server";
import { ConfirmModal, EntityChip } from "~/ui";
import { DAY_KEYS } from "./AddLessonDrawer";

type LessonDetailDrawerProps = {
  entry: PlannerEntry | null;
  hasConflict: boolean;
  onClose: () => void;
  onRemove: (entryId: string) => void;
  isRemoving: boolean;
};

function toHHMM(totalMinutes: number) {
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * Click-to-open detail view for an existing lesson (UX-UI-principles §10):
 * shows all involved entities and the sole destructive action, always behind
 * a confirmation step.
 */
export function LessonDetailDrawer({ entry, hasConflict, onClose, onRemove, isRemoving }: LessonDetailDrawerProps) {
  const { t } = useTranslation();
  const [confirmOpened, setConfirmOpened] = useState(false);

  const timeslot = entry?.timeslot;
  const subjectName = timeslot?.subject?.name ?? null;

  // Nesting a Modal inside a Drawer means Mantine's focus-trap treats a
  // confirm click as "outside" the drawer too, so both close together —
  // matches the instant-close-on-confirm pattern used by every other
  // ConfirmModal in this app (none of which are drawer-nested).
  const handleConfirmRemove = () => {
    if (!entry) return;
    onRemove(entry.entryId);
    setConfirmOpened(false);
    onClose();
  };

  return (
    <>
      <Drawer
        opened={entry !== null}
        onClose={onClose}
        position="right"
        size="md"
        title={<Title order={4}>{t("planner.lessonDetails")}</Title>}
      >
        {timeslot && (
          <Stack gap="md">
            {hasConflict && (
              <Alert color="poppy" variant="light" icon={<IconAlertTriangle size={16} aria-hidden />}>
                <Text fw={600} size="sm">
                  {t("planner.conflict")}
                </Text>
                <Text size="sm">{t("planner.conflictMessage")}</Text>
              </Alert>
            )}

            <Stack gap={2}>
              <Text size="xs" c="dimmed">
                {t("planner.day")}
              </Text>
              <Text fw={600}>
                {t(`planner.days.${DAY_KEYS[timeslot.dayOfWeek]}`)} · {toHHMM(timeslot.startMinute)} – {toHHMM(timeslot.endMinute)}
              </Text>
            </Stack>

            {subjectName && (
              <Title order={3} size="h4">
                {subjectName}
              </Title>
            )}

            <Group gap="xs" wrap="wrap">
              {timeslot.class && <EntityChip kind="class" label={timeslot.class.name} />}
              {timeslot.teacher && <EntityChip kind="teacher" label={timeslot.teacher.name} />}
              {timeslot.classroom && <EntityChip kind="classroom" label={timeslot.classroom.name} />}
            </Group>

            {!timeslot.class && !timeslot.teacher && !timeslot.classroom && !subjectName && (
              <Text size="sm" c="dimmed">
                {t("planner.noDetails")}
              </Text>
            )}

            <Group justify="flex-end" mt="sm">
              <Button
                variant="light"
                color="poppy"
                onClick={() => setConfirmOpened(true)}
                loading={isRemoving}
              >
                {t("planner.removeLesson")}
              </Button>
            </Group>
          </Stack>
        )}
      </Drawer>

      <ConfirmModal
        opened={confirmOpened}
        onClose={() => setConfirmOpened(false)}
        onConfirm={handleConfirmRemove}
        title={t("planner.removeLessonConfirmTitle")}
        danger
      >
        {t("planner.removeLessonConfirmMessage")}
      </ConfirmModal>
    </>
  );
}
