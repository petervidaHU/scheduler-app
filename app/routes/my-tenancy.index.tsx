import { Badge, Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useOutletContext } from "react-router";
import type { MyTenancyOutletContext } from "./my-tenancy-layout";

export default function MyTenancyDashboard() {
  const { t } = useTranslation();
  const { user } = useOutletContext<MyTenancyOutletContext>();

  return (
    <Stack gap="md">
      <Title order={3}>{t("dashboard.myTenancyDashboard")}</Title>
      <Text c="dimmed">{t("dashboard.welcomeDashboard")}</Text>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Card withBorder radius="md" p="md">
          <Group justify="space-between">
            <Text fw={600}>{t("dashboard.tenancyId")}</Text>
            <Badge variant="light">{user.tenancyId}</Badge>
          </Group>
        </Card>
        <Card withBorder radius="md" p="md">
          <Group justify="space-between">
            <Text fw={600}>{t("dashboard.role")}</Text>
            <Badge variant="light" color="teal">
              {user.role ?? "N/A"}
            </Badge>
          </Group>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
