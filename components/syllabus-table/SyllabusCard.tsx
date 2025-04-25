import { Paper, Divider, Group, Text } from "@mantine/core";
import React, { FC } from "react";
import NotificationCard from "../UI-elements/NotificationBadges";
import { ScheduleValidationResult } from "@/lib/hooks/scheduleValidationTypes";

interface props {
  subjectLabel: string;
  teacherLabel: string;
  occurence: number;
  validationErrors: ScheduleValidationResult;
  plannedOccurence: number;
  helperColor?: string;
}

const SyllabusCard: FC<props> = ({
  subjectLabel,
  teacherLabel,
  occurence,
  validationErrors,
  plannedOccurence,
  helperColor = null,
}) => {
  const isAllSetted =
    occurence === plannedOccurence
      ? "green"
      : occurence > plannedOccurence
        ? "red"
        : "yellow";
  return (
      <Paper
        shadow="sm"
        withBorder
        p="xl"
        styles={{ root: { backgroundColor: isAllSetted } }}
      >
        <span
          style={{
            display: "block",
            height: "2rem",
            backgroundColor: helperColor || "white",
          }}
        ></span>
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
          {Object.entries(validationErrors).map(([k, e]) => {
            if (!e) return;
            return (
              <NotificationCard
                key={k}
                message={`${e.message} (${e.num} times)`}
                type={e.type}
                context={e.context}
              />
            );
          })}
        </Group>
      </Paper>
  );
};

export default SyllabusCard;
