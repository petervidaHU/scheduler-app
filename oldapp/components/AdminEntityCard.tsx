"use client";
import { Card, Button, Group, Text, Title } from "@mantine/core";

interface AdminEntityCardProps {
  title: string;
  description: string;
  count: number | null;
  onCreate: () => void;
  createLabel: string;
}

export default function AdminEntityCard({ title, description, count, onCreate, createLabel }: AdminEntityCardProps) {
  return (
    <Card shadow="md" radius="lg" p="lg" withBorder style={{ minWidth: 220, maxWidth: 320, flex: 1 }}>
      <Group justify="space-between" align="center" mb="xs">
        <Title order={4}>{title}</Title>
        <Text size="sm" c="dimmed">{count !== null ? `${count}` : "-"}</Text>
      </Group>
      <Text size="sm" mb="md">{description}</Text>
      <Button fullWidth onClick={onCreate}>{createLabel}</Button>
    </Card>
  );
}
