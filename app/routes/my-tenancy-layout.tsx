import { Anchor, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { Link, Outlet, useOutletContext } from "react-router";
import { useTranslation } from "react-i18next";
import type { TenancyOutletContext } from "./tenancy-layout";

export type MyTenancyOutletContext = TenancyOutletContext;

export default function MyTenancyLayout() {
  const { t } = useTranslation();
  const outletContext = useOutletContext<TenancyOutletContext>();

  return (
    <Stack gap="md">
      <Paper withBorder radius="md" p="md">
        <Stack gap="xs">
          <Title order={4}>{t("dashboard.myTenancyDashboard")}</Title>
          <Text size="sm" c="dimmed">
            Tenancy ID: {outletContext.user.tenancyId}
          </Text>
          <Group gap="xs" wrap="wrap">
            <Anchor component={Link} to={`/${outletContext.locale}/my-tenancy`}>
              Dashboard
            </Anchor>
            <Anchor component={Link} to={`/${outletContext.locale}/my-tenancy/admin`}>
              Admin
            </Anchor>
            <Anchor component={Link} to={`/${outletContext.locale}/my-tenancy/schedules`}>
              Schedules
            </Anchor>
            <Anchor component={Link} to={`/${outletContext.locale}/my-tenancy/timeslots`}>
              Timeslots
            </Anchor>
            <Anchor component={Link} to={`/${outletContext.locale}/my-tenancy/syllabus`}>
              {t("syllabus.title")}
            </Anchor>
          </Group>
        </Stack>
      </Paper>

      <Outlet context={outletContext} />
    </Stack>
  );
}
