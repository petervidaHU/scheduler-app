import { Badge, Card, Group, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useOutletContext } from "react-router";
import { PageHeader } from "~/ui";
import type { TenancyOutletContext } from "./tenancy-layout";

export default function ProtectedDashboard() {
  const { t } = useTranslation();
  const { user } = useOutletContext<TenancyOutletContext>();

  return (
    <Stack gap="lg">
      <PageHeader
        title={t("nav.dashboard")}
        description={t("dashboard.dashboardAccess")}
      />

      <Card withBorder maw={420}>
        <Stack gap="xs">
          <Group justify="space-between">
            <Text fw={600}>{user.tenancyName}</Text>
            <Badge variant="light">{user.role}</Badge>
          </Group>
          <Text size="sm" c="dimmed">
            {user.email}
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
}
