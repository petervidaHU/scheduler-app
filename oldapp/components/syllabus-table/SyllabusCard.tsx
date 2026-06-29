import { Group, Text, Box, ThemeIcon, Tooltip } from "@mantine/core";
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

const getStatusColor = (occurence: number, plannedOccurence: number) => {
  if (occurence === plannedOccurence) return "green";
  if (occurence > plannedOccurence) return "red";
  return "yellow";
};

const SyllabusCard: FC<props> = ({
  subjectLabel,
  teacherLabel,
  occurence,
  validationErrors,
  plannedOccurence,
  helperColor = null,
}) => {
  const statusColor = getStatusColor(occurence, plannedOccurence);
  return (
    <Group align="center" gap="xs" style={{
      borderLeft: `4px solid var(--mantine-color-${statusColor}-6)`,
      padding: "8px 12px",
      marginBottom: 4,
      background: "var(--mantine-color-gray-1)", // darker than gray-0 for better contrast
      borderRadius: 6,
      minHeight: 40,
      fontSize: 14,
      width: "100%",
      boxSizing: "border-box",
    }}>
      <Tooltip label={statusColor === "green" ? "OK" : statusColor === "yellow" ? "Missing lessons" : "Too many lessons"}>
        <ThemeIcon size="sm" color={statusColor} radius="xl" />
      </Tooltip>
      <Box style={{ flex: 2, minWidth: 120 }}>
        <Text fw={500} size="sm" style={{ color: "var(--mantine-color-dark-8)" }} truncate>{subjectLabel}</Text>
      </Box>
      <Box style={{ flex: 2, minWidth: 120 }}>
        <Text size="xs" style={{ color: "var(--mantine-color-dark-7)" }} truncate>{teacherLabel}</Text>
      </Box>
      <Box style={{ flex: 1, minWidth: 60, textAlign: "center" }}>
        <Text size="sm" fw={700} style={{ color: "var(--mantine-color-dark-8)" }}>{occurence}</Text>
        <Text size="xs" c="dimmed">/ {plannedOccurence}</Text>
      </Box>
      <Group gap={4} style={{ flex: 3 }}>
        {Object.entries(validationErrors).map(([k, e]) => {
          if (!e) return null;
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
    </Group>
  );
};

export default SyllabusCard;
