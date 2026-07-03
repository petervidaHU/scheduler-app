import { Group, Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  /** One-line dimmed description under the title. */
  description?: string;
  /** The page's single primary action (plus at most a secondary Menu). */
  actions?: ReactNode;
};

/**
 * The one page title per screen (UX-UI-principles §3.2). Renders the only
 * h1-level heading; route components must not add competing titles.
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
      <Stack gap={4}>
        <Title order={1} size="h2">
          {title}
        </Title>
        {description && (
          <Text c="dimmed" size="sm">
            {description}
          </Text>
        )}
      </Stack>
      {actions && <Group gap="xs">{actions}</Group>}
    </Group>
  );
}
