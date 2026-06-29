import { Paper, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";

export default function PricingPage() {
  const { t } = useTranslation();

  return (
    <Stack maw={760} mx="auto" mt="xl" gap="md">
      <Title order={2}>{t("pricing.message1")}</Title>
      <Paper withBorder radius="md" p="md">
        <Text c="dimmed">{t("pricing.message2")}</Text>
      </Paper>
    </Stack>
  );
}
