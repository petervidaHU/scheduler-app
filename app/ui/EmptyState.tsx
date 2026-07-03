import { Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon?: Icon;
  title: string;
  /** Explain *why* it is empty — name the missing prerequisite when there is one. */
  message?: string;
  /** Link or button leading to the fix (UX-UI-principles §3.3). */
  action?: ReactNode;
};

/**
 * Empty states teach the dependency chain: say what is missing and link to
 * where the user can create it.
 */
export function EmptyState({ icon: IconComponent, title, message, action }: EmptyStateProps) {
  return (
    <Paper
      withBorder
      p="xl"
      radius="lg"
      shadow="none"
      style={{ borderStyle: "dashed", background: "transparent" }}
    >
      <Stack align="center" gap="sm" py="md">
        {IconComponent && (
          <ThemeIcon variant="light" size="xl" radius="xl">
            <IconComponent size={24} aria-hidden />
          </ThemeIcon>
        )}
        <Title order={3} size="h5" ta="center">
          {title}
        </Title>
        {message && (
          <Text c="dimmed" size="sm" ta="center" maw={420}>
            {message}
          </Text>
        )}
        {action}
      </Stack>
    </Paper>
  );
}
