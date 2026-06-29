import { List, Paper, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";

export default function DocumentationPage() {
  const { t } = useTranslation();

  return (
    <Stack maw={760} mx="auto" mt="xl" gap="md">
      <Title order={2}>{t("documentation.title")}</Title>
      <Text>{t("documentation.welcome")}</Text>

      <Paper withBorder radius="md" p="md">
        <Title order={4}>{t("documentation.gettingStarted")}</Title>
        <List mt="sm" spacing="xs">
          <List.Item>{t("documentation.navigateMenu")}</List.Item>
          <List.Item>{t("documentation.useAdmin")}</List.Item>
          <List.Item>{t("documentation.manageSchedules")}</List.Item>
        </List>
      </Paper>

      <Paper withBorder radius="md" p="md">
        <Title order={4}>{t("documentation.support")}</Title>
        <Text mt="sm">{t("documentation.helpContact")}</Text>
      </Paper>
    </Stack>
  );
}
