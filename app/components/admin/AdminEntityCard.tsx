import { Button, Card, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { entityMeta, type EntityKind } from "~/ui";

export type ResourcePluralLabelKey =
  | "nav.classrooms"
  | "nav.classes"
  | "nav.specialties"
  | "nav.subjects"
  | "nav.teachers"
  | "nav.frames";

type AdminEntityCardProps = {
  kind: EntityKind;
  pluralLabelKey: ResourcePluralLabelKey;
  count: number;
  createTo: string;
};

export default function AdminEntityCard({
  kind,
  pluralLabelKey,
  count,
  createTo,
}: AdminEntityCardProps) {
  const { t } = useTranslation();
  const meta = entityMeta[kind];
  const IconComponent = meta.icon;

  return (
    <Card shadow="md" radius="lg" p="lg" withBorder>
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <ThemeIcon variant="light" color={meta.colorKey} radius="xl">
              <IconComponent size={18} aria-hidden />
            </ThemeIcon>
            <Title order={4}>{t(pluralLabelKey)}</Title>
          </Group>
          <Text size="sm" c="dimmed">
            {count}
          </Text>
        </Group>

        <Button component={Link} to={createTo} variant="light" color={meta.colorKey} fullWidth>
          {t("adminForm.createLabel", { entity: t(meta.labelKey) })}
        </Button>
      </Stack>
    </Card>
  );
}
