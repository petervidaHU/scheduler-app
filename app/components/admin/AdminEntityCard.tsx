import { Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router";

type AdminEntityCardProps = {
  title: string;
  description: string;
  count: number;
  createLabel: string;
  createTo: string;
};

export default function AdminEntityCard({
  title,
  description,
  count,
  createLabel,
  createTo,
}: AdminEntityCardProps) {
  return (
    <Card shadow="md" radius="lg" p="lg" withBorder>
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Title order={4}>{title}</Title>
          <Text size="sm" c="dimmed">
            {count}
          </Text>
        </Group>

        <Text size="sm" c="dimmed">
          {description}
        </Text>

        <Button component={Link} to={createTo} variant="light" fullWidth>
          {createLabel}
        </Button>
      </Stack>
    </Card>
  );
}