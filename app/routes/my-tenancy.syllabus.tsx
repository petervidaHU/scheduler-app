import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Drawer,
  Group,
  NumberInput,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { IconBook2 } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useFetcher, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/my-tenancy.syllabus";
import { requireTenancyUser } from "../lib/services/auth/guards.server";
import {
  loadSyllabusPage,
  createSyllabusEntry,
  updateSyllabusEntry,
  deleteSyllabusEntry,
  type SyllabusItemRow,
  type SyllabusEntityOption,
} from "../lib/services/syllabus/manageSyllabus.server";
import { ConfirmModal, EmptyState, PageHeader } from "~/ui";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await requireTenancyUser({ request, locale: params.locale });
  const data = await loadSyllabusPage(user.tenancyId, request.url);
  return { ...data, locale: params.locale };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await requireTenancyUser({ request, locale: params.locale });
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");

  if (intent === "create-item") return { ...(await createSyllabusEntry(user.tenancyId, formData)), intent };
  if (intent === "update-item") return { ...(await updateSyllabusEntry(user.tenancyId, formData)), intent };
  if (intent === "delete-item") return { ...(await deleteSyllabusEntry(user.tenancyId, formData)), intent };
  return { ok: false as const, errors: { form: `Unknown intent: ${intent}` }, intent };
}

// ─── Drawer form ─────────────────────────────────────────────────────────────

type DrawerMode = { mode: "create" } | { mode: "edit"; item: SyllabusItemRow };

type SyllabusMutationResult =
  | { ok: true; intent: string }
  | { ok: false; errors: Record<string, string>; intent: string };

interface SyllabusDrawerProps {
  opened: boolean;
  drawerMode: DrawerMode;
  options: { subjects: SyllabusEntityOption[]; classes: SyllabusEntityOption[] };
  onClose: () => void;
}

function SyllabusDrawer({ opened, drawerMode, options, onClose }: SyllabusDrawerProps) {
  const { t } = useTranslation();
  const fetcher = useFetcher<SyllabusMutationResult>();
  const isEditing = drawerMode.mode === "edit";
  const editItem = isEditing ? drawerMode.item : null;

  const form = useForm({
    initialValues: {
      subjectId: editItem?.subject.id ?? "",
      classId: editItem?.class?.id ?? "",
      week: editItem?.week ?? 1,
      topic: editItem?.topic ?? "",
      notes: editItem?.notes ?? "",
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = form.onSubmit((values) => {
    const data = new FormData();
    data.set("intent", isEditing ? "update-item" : "create-item");
    if (isEditing && editItem) data.set("id", editItem.id);
    data.set("subjectId", values.subjectId);
    data.set("classId", values.classId);
    data.set("week", String(values.week));
    data.set("topic", values.topic);
    data.set("notes", values.notes);
    fetcher.submit(data, { method: "post" });
  });

  // Close and toast only once the server confirms success; keep the drawer
  // open with inline errors if validation fails (UX-UI-principles §7).
  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;

    if (fetcher.data.ok) {
      notifications.show({
        color: "tiffany",
        message: isEditing ? t("syllabus.entryUpdated") : t("syllabus.entryCreated"),
      });
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state, fetcher.data]);

  const errors = fetcher.data && !fetcher.data.ok ? fetcher.data.errors : {};

  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
      title={
        <Title order={4}>
          {isEditing ? t("syllabus.editEntry") : t("syllabus.addEntry")}
        </Title>
      }
      position="right"
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Select
            label={t("syllabus.subject")}
            data={options.subjects.map((s) => ({ value: s.id, label: s.name }))}
            searchable
            required
            error={errors.subjectId}
            {...form.getInputProps("subjectId")}
          />
          <Select
            label={t("syllabus.class")}
            data={options.classes.map((c) => ({ value: c.id, label: c.name }))}
            clearable
            searchable
            error={errors.classId}
            {...form.getInputProps("classId")}
          />
          <NumberInput
            label={t("syllabus.week")}
            min={1}
            max={52}
            required
            error={errors.week}
            {...form.getInputProps("week")}
          />
          <TextInput
            label={t("syllabus.topic")}
            required
            error={errors.topic}
            {...form.getInputProps("topic")}
          />
          <Textarea
            label={t("syllabus.notes")}
            autosize
            minRows={2}
            error={errors.notes}
            {...form.getInputProps("notes")}
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" type="button" onClick={handleClose}>
              {t("syllabus.cancel")}
            </Button>
            <Button type="submit" loading={fetcher.state !== "idle"}>
              {isEditing ? t("syllabus.saveChanges") : t("syllabus.addEntry")}
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function SyllabusPage({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { items, options, filters } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const deleteFetcher = useFetcher<SyllabusMutationResult>();

  const [drawerOpened, setDrawerOpened] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>({ mode: "create" });
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const openCreate = () => {
    setDrawerMode({ mode: "create" });
    setDrawerOpened(true);
  };

  const openEdit = (item: SyllabusItemRow) => {
    setDrawerMode({ mode: "edit", item });
    setDrawerOpened(true);
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    const data = new FormData();
    data.set("intent", "delete-item");
    data.set("id", pendingDeleteId);
    deleteFetcher.submit(data, { method: "post" });
    setPendingDeleteId(null);
  };

  useEffect(() => {
    if (deleteFetcher.state !== "idle" || !deleteFetcher.data) return;

    if (deleteFetcher.data.ok) {
      notifications.show({ color: "tiffany", message: t("syllabus.entryDeleted") });
    } else {
      notifications.show({
        color: "poppy",
        message: Object.values(deleteFetcher.data.errors).join(" "),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteFetcher.state, deleteFetcher.data]);

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  };

  return (
    <Stack gap="lg">
      <PageHeader
        title={t("syllabus.title")}
        actions={<Button onClick={openCreate}>{t("syllabus.addEntry")}</Button>}
      />

      <Group gap="sm">
        <Select
          placeholder={t("syllabus.allSubjects")}
          data={options.subjects.map((s) => ({ value: s.id, label: s.name }))}
          value={filters.subjectId || null}
          onChange={(v) => updateFilter("subjectId", v ?? "")}
          clearable
          searchable
          style={{ minWidth: 200 }}
        />
        <Select
          placeholder={t("syllabus.allClasses")}
          data={options.classes.map((c) => ({ value: c.id, label: c.name }))}
          value={filters.classId || null}
          onChange={(v) => updateFilter("classId", v ?? "")}
          clearable
          searchable
          style={{ minWidth: 200 }}
        />
      </Group>

      {items.length === 0 ? (
        <EmptyState icon={IconBook2} title={t("syllabus.noItems")} />
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t("syllabus.week")}</Table.Th>
              <Table.Th>{t("syllabus.subject")}</Table.Th>
              <Table.Th>{t("syllabus.class")}</Table.Th>
              <Table.Th>{t("syllabus.topic")}</Table.Th>
              <Table.Th>{t("syllabus.notes")}</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {items.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Badge variant="light">{t("syllabus.weekLabel", { week: String(item.week) })}</Badge>
                </Table.Td>
                <Table.Td>{item.subject.name}</Table.Td>
                <Table.Td>{item.class?.name ?? <Text size="xs" c="dimmed">—</Text>}</Table.Td>
                <Table.Td>{item.topic}</Table.Td>
                <Table.Td>
                  <Text size="xs" c="dimmed" lineClamp={2}>
                    {item.notes ?? "—"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="flex-end">
                    <Button size="xs" variant="subtle" onClick={() => openEdit(item)}>
                      {t("syllabus.edit")}
                    </Button>
                    <Button
                      size="xs"
                      variant="subtle"
                      color="poppy"
                      loading={deleteFetcher.state !== "idle"}
                      onClick={() => setPendingDeleteId(item.id)}
                    >
                      {t("syllabus.delete")}
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <SyllabusDrawer
        opened={drawerOpened}
        drawerMode={drawerMode}
        options={options}
        onClose={() => setDrawerOpened(false)}
      />

      <ConfirmModal
        opened={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("syllabus.deleteConfirmTitle")}
        danger
      >
        {t("syllabus.deleteConfirmMessage")}
      </ConfirmModal>
    </Stack>
  );
}
