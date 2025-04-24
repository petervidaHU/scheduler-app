import { Paper, Divider, Group, Text } from "@mantine/core";
import React, { FC } from "react";
import NotificationCard from "../UI-elements/NotificationBadges";
import { ScheduleValidationResult } from "@/lib/hooks/scheduleValidationTypes";

interface props {
  toKey: string;
  subjectLabel: string;
  teacherLabel: string;
  occurence: number;
  validationErrors: ScheduleValidationResult;
  plannedOccurence: number;
}

const SyllabusCard: FC<props> = ({
  toKey,
  subjectLabel,
  teacherLabel,
  occurence,
  validationErrors,
  plannedOccurence,
}) => {
  const isAllSetted =
    occurence === plannedOccurence
      ? "green"
      : occurence > plannedOccurence
        ? "red"
        : "yellow";
  return (
    <React.Fragment key={toKey}>
      <Paper
        shadow="sm"
        withBorder
        p="xl"
        styles={{ root: { backgroundColor: isAllSetted } }}
      >
        <Text fw={700} size="lg">
          {subjectLabel}
        </Text>
        <Divider my="md" />
        <Text fw={500} size="md">
          preferred teacher
        </Text>
        <Text fw={700} size="lg">
          {teacherLabel}
        </Text>
        <Divider my="md" />
        <Text fw={500} size="md">
          placed
        </Text>
        <Text fw={900} size="lg">
          {occurence}
        </Text>
        <Text fw={500} size="lg">
          planned occurence:
        </Text>
        <Text fw={700} size="lg">
          {plannedOccurence}
        </Text>
        <Group mt="md">
          {Object.values(validationErrors)
            .filter((e) => e !== null)
            .map((e) => (
              <React.Fragment key={e.key}>
                <NotificationCard
                  message={`${e.message} (${e.num} times)`}
                  type={e.type}
                  context={e.context}
                />
              </React.Fragment>
            ))}
        </Group>
      </Paper>
    </React.Fragment>
  );
};

export default SyllabusCard;
