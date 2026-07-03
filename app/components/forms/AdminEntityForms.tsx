import { Button, Group, Select, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useSubmit } from "react-router";
import { useTranslation } from "react-i18next";
import type {
  AdminEntityFormValues,
  AdminEntityKey,
  AdminFormOptions,
} from "../../lib/services/tenancy/manageAdminEntities.server";

type CommonProps = {
  entity: AdminEntityKey;
  options: AdminFormOptions;
  initialValues?: AdminEntityFormValues;
  entityId?: string;
};

function useEntitySubmit(entity: AdminEntityKey, entityId?: string) {
  const submit = useSubmit();

  return (payload: Record<string, string>) => {
    const formData = new FormData();
    formData.set("entity", entity);
    if (entityId) formData.set("entityId", entityId);

    Object.entries(payload).forEach(([key, value]) => {
      formData.set(key, value);
    });

    submit(formData, { method: "post" });
  };
}

function SubmitButton({ entityId, entityLabel }: { entityId?: string; entityLabel: string }) {
  const { t } = useTranslation();
  return (
    <Group justify="flex-end">
      <Button type="submit">
        {entityId ? t("adminForm.saveChangesLabel") : t("adminForm.createLabel", { entity: entityLabel })}
      </Button>
    </Group>
  );
}

function SpecialtyForm({ initialValues, entityId }: CommonProps) {
  const { t } = useTranslation();
  const entityLabel = t("entities.specialty");
  const submitEntity = useEntitySubmit("specialty", entityId);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: initialValues?.name ?? "",
      code: initialValues?.code ?? "",
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? t("adminForm.nameRequired", { entity: entityLabel }) : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => submitEntity(values))}>
      <Stack gap="sm">
        <TextInput
          label={t("adminForm.nameLabel", { entity: entityLabel })}
          key={form.key("name")}
          {...form.getInputProps("name")}
        />
        <TextInput label={t("adminForm.codeLabel")} key={form.key("code")} {...form.getInputProps("code")} />
        <SubmitButton entityId={entityId} entityLabel={entityLabel} />
      </Stack>
    </form>
  );
}

function SubjectForm({ options, initialValues, entityId }: CommonProps) {
  const { t } = useTranslation();
  const entityLabel = t("entities.subject");
  const submitEntity = useEntitySubmit("subject", entityId);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: initialValues?.name ?? "",
      code: initialValues?.code ?? "",
      specialtyId: initialValues?.specialtyId ?? "",
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? t("adminForm.nameRequired", { entity: entityLabel }) : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => submitEntity(values))}>
      <Stack gap="sm">
        <TextInput
          label={t("adminForm.nameLabel", { entity: entityLabel })}
          key={form.key("name")}
          {...form.getInputProps("name")}
        />
        <TextInput label={t("adminForm.codeLabel")} key={form.key("code")} {...form.getInputProps("code")} />
        <Select
          label={t("entities.specialty")}
          placeholder={t("adminForm.optionalPlaceholder")}
          data={options.specialties}
          key={form.key("specialtyId")}
          clearable
          {...form.getInputProps("specialtyId")}
        />
        <SubmitButton entityId={entityId} entityLabel={entityLabel} />
      </Stack>
    </form>
  );
}

function TeacherForm({ initialValues, entityId }: CommonProps) {
  const { t } = useTranslation();
  const entityLabel = t("entities.teacher");
  const submitEntity = useEntitySubmit("teacher", entityId);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: initialValues?.name ?? "",
      email: initialValues?.email ?? "",
      code: initialValues?.code ?? "",
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? t("adminForm.nameRequired", { entity: entityLabel }) : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => submitEntity(values))}>
      <Stack gap="sm">
        <TextInput
          label={t("adminForm.nameLabel", { entity: entityLabel })}
          key={form.key("name")}
          {...form.getInputProps("name")}
        />
        <TextInput label={t("adminForm.emailLabel")} key={form.key("email")} {...form.getInputProps("email")} />
        <TextInput label={t("adminForm.codeLabel")} key={form.key("code")} {...form.getInputProps("code")} />
        <SubmitButton entityId={entityId} entityLabel={entityLabel} />
      </Stack>
    </form>
  );
}

function ClassroomForm({ initialValues, entityId }: CommonProps) {
  const { t } = useTranslation();
  const entityLabel = t("entities.classroom");
  const submitEntity = useEntitySubmit("classroom", entityId);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: initialValues?.name ?? "",
      capacity: initialValues?.capacity ?? "",
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? t("adminForm.nameRequired", { entity: entityLabel }) : null),
      capacity: (value) => {
        if (!value) return null;
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? null : t("adminForm.capacityInvalid");
      },
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => submitEntity(values))}>
      <Stack gap="sm">
        <TextInput
          label={t("adminForm.nameLabel", { entity: entityLabel })}
          key={form.key("name")}
          {...form.getInputProps("name")}
        />
        <TextInput
          label={t("adminForm.capacityLabel")}
          placeholder={t("adminForm.optionalPlaceholder")}
          key={form.key("capacity")}
          {...form.getInputProps("capacity")}
        />
        <SubmitButton entityId={entityId} entityLabel={entityLabel} />
      </Stack>
    </form>
  );
}

function ClassForm({ options, initialValues, entityId }: CommonProps) {
  const { t } = useTranslation();
  const entityLabel = t("entities.class");
  const submitEntity = useEntitySubmit("class", entityId);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: initialValues?.name ?? "",
      code: initialValues?.code ?? "",
      specialtyId: initialValues?.specialtyId ?? "",
      teacherId: initialValues?.teacherId ?? "",
      classroomId: initialValues?.classroomId ?? "",
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? t("adminForm.nameRequired", { entity: entityLabel }) : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => submitEntity(values))}>
      <Stack gap="sm">
        <TextInput
          label={t("adminForm.nameLabel", { entity: entityLabel })}
          key={form.key("name")}
          {...form.getInputProps("name")}
        />
        <TextInput label={t("adminForm.codeLabel")} key={form.key("code")} {...form.getInputProps("code")} />
        <Select
          label={t("entities.specialty")}
          placeholder={t("adminForm.optionalPlaceholder")}
          data={options.specialties}
          clearable
          key={form.key("specialtyId")}
          {...form.getInputProps("specialtyId")}
        />
        <Select
          label={t("entities.teacher")}
          placeholder={t("adminForm.optionalPlaceholder")}
          data={options.teachers}
          clearable
          key={form.key("teacherId")}
          {...form.getInputProps("teacherId")}
        />
        <Select
          label={t("entities.classroom")}
          placeholder={t("adminForm.optionalPlaceholder")}
          data={options.classrooms}
          clearable
          key={form.key("classroomId")}
          {...form.getInputProps("classroomId")}
        />
        <SubmitButton entityId={entityId} entityLabel={entityLabel} />
      </Stack>
    </form>
  );
}

function FrameForm({ initialValues, entityId }: CommonProps) {
  const { t } = useTranslation();
  const entityLabel = t("entities.frame");
  const submitEntity = useEntitySubmit("frame", entityId);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: initialValues?.name ?? "",
      startDate: initialValues?.startDate ?? "",
      endDate: initialValues?.endDate ?? "",
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? t("adminForm.nameRequired", { entity: entityLabel }) : null),
      startDate: (value) => (value ? null : t("adminForm.startDateRequired")),
      endDate: (value, values) => {
        if (!value) return t("adminForm.endDateRequired");
        if (values.startDate && new Date(value) < new Date(values.startDate)) {
          return t("adminForm.endDateBeforeStart");
        }
        return null;
      },
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) =>
        submitEntity({ name: values.name, startDate: values.startDate, endDate: values.endDate }),
      )}
    >
      <Stack gap="sm">
        <TextInput
          label={t("adminForm.nameLabel", { entity: entityLabel })}
          key={form.key("name")}
          {...form.getInputProps("name")}
        />
        <TextInput
          type="date"
          label={t("adminForm.startDateLabel")}
          key={form.key("startDate")}
          {...form.getInputProps("startDate")}
        />
        <TextInput
          type="date"
          label={t("adminForm.endDateLabel")}
          key={form.key("endDate")}
          {...form.getInputProps("endDate")}
        />
        <SubmitButton entityId={entityId} entityLabel={entityLabel} />
      </Stack>
    </form>
  );
}

export default function AdminEntityForms(props: CommonProps) {
  switch (props.entity) {
    case "specialty":
      return <SpecialtyForm {...props} />;
    case "subject":
      return <SubjectForm {...props} />;
    case "teacher":
      return <TeacherForm {...props} />;
    case "classroom":
      return <ClassroomForm {...props} />;
    case "class":
      return <ClassForm {...props} />;
    case "frame":
      return <FrameForm {...props} />;
  }
}
