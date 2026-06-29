import { Button, Group, Select, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useSubmit } from "react-router";
import type { AdminEntityKey, AdminFormOptions } from "../../lib/services/tenancy/manageAdminEntities.server";

type CommonProps = {
  entity: AdminEntityKey;
  options: AdminFormOptions;
};

function useEntitySubmit(entity: AdminEntityKey) {
  const submit = useSubmit();

  return (payload: Record<string, string>) => {
    const formData = new FormData();
    formData.set("entity", entity);

    Object.entries(payload).forEach(([key, value]) => {
      formData.set(key, value);
    });

    submit(formData, { method: "post" });
  };
}

function SpecialtyForm() {
  const submitEntity = useEntitySubmit("specialty");
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      code: "",
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? "Specialty name is required" : null),
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        submitEntity(values);
      })}
    >
      <Stack gap="sm">
        <TextInput label="Specialty name" key={form.key("name")} {...form.getInputProps("name")} />
        <TextInput label="Code" key={form.key("code")} {...form.getInputProps("code")} />
        <Group justify="flex-end">
          <Button type="submit">Create specialty</Button>
        </Group>
      </Stack>
    </form>
  );
}

function SubjectForm({ options }: { options: AdminFormOptions }) {
  const submitEntity = useEntitySubmit("subject");
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      code: "",
      specialtyId: "",
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? "Subject name is required" : null),
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        submitEntity(values);
      })}
    >
      <Stack gap="sm">
        <TextInput label="Subject name" key={form.key("name")} {...form.getInputProps("name")} />
        <TextInput label="Code" key={form.key("code")} {...form.getInputProps("code")} />
        <Select
          label="Specialty"
          placeholder="Optional"
          data={options.specialties}
          key={form.key("specialtyId")}
          clearable
          {...form.getInputProps("specialtyId")}
        />
        <Group justify="flex-end">
          <Button type="submit">Create subject</Button>
        </Group>
      </Stack>
    </form>
  );
}

function TeacherForm() {
  const submitEntity = useEntitySubmit("teacher");
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      email: "",
      code: "",
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? "Teacher name is required" : null),
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        submitEntity(values);
      })}
    >
      <Stack gap="sm">
        <TextInput label="Teacher name" key={form.key("name")} {...form.getInputProps("name")} />
        <TextInput label="Email" key={form.key("email")} {...form.getInputProps("email")} />
        <TextInput label="Code" key={form.key("code")} {...form.getInputProps("code")} />
        <Group justify="flex-end">
          <Button type="submit">Create teacher</Button>
        </Group>
      </Stack>
    </form>
  );
}

function ClassroomForm() {
  const submitEntity = useEntitySubmit("classroom");
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      capacity: "",
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? "Classroom name is required" : null),
      capacity: (value) => {
        if (!value) {
          return null;
        }
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0
          ? null
          : "Capacity must be a positive number";
      },
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        submitEntity(values);
      })}
    >
      <Stack gap="sm">
        <TextInput label="Classroom name" key={form.key("name")} {...form.getInputProps("name")} />
        <TextInput
          label="Capacity"
          placeholder="Optional"
          key={form.key("capacity")}
          {...form.getInputProps("capacity")}
        />
        <Group justify="flex-end">
          <Button type="submit">Create classroom</Button>
        </Group>
      </Stack>
    </form>
  );
}

function ClassForm({ options }: { options: AdminFormOptions }) {
  const submitEntity = useEntitySubmit("class");
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      code: "",
      specialtyId: "",
      teacherId: "",
      classroomId: "",
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? "Class name is required" : null),
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        submitEntity(values);
      })}
    >
      <Stack gap="sm">
        <TextInput label="Class name" key={form.key("name")} {...form.getInputProps("name")} />
        <TextInput label="Code" key={form.key("code")} {...form.getInputProps("code")} />
        <Select
          label="Specialty"
          placeholder="Optional"
          data={options.specialties}
          clearable
          key={form.key("specialtyId")}
          {...form.getInputProps("specialtyId")}
        />
        <Select
          label="Teacher"
          placeholder="Optional"
          data={options.teachers}
          clearable
          key={form.key("teacherId")}
          {...form.getInputProps("teacherId")}
        />
        <Select
          label="Classroom"
          placeholder="Optional"
          data={options.classrooms}
          clearable
          key={form.key("classroomId")}
          {...form.getInputProps("classroomId")}
        />
        <Group justify="flex-end">
          <Button type="submit">Create class</Button>
        </Group>
      </Stack>
    </form>
  );
}

function FrameForm() {
  const submitEntity = useEntitySubmit("frame");
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      startDate: "",
      endDate: "",
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? "Frame name is required" : null),
      startDate: (value) => (value ? null : "Start date is required"),
      endDate: (value, values) => {
        if (!value) {
          return "End date is required";
        }
        if (values.startDate && new Date(value) < new Date(values.startDate)) {
          return "End date must be after start date";
        }
        return null;
      },
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        submitEntity({
          name: values.name,
          startDate: values.startDate,
          endDate: values.endDate,
        });
      })}
    >
      <Stack gap="sm">
        <TextInput label="Frame name" key={form.key("name")} {...form.getInputProps("name")} />
        <TextInput
          type="date"
          label="Start date"
          key={form.key("startDate")}
          {...form.getInputProps("startDate")}
        />
        <TextInput
          type="date"
          label="End date"
          key={form.key("endDate")}
          {...form.getInputProps("endDate")}
        />
        <Group justify="flex-end">
          <Button type="submit">Create frame</Button>
        </Group>
      </Stack>
    </form>
  );
}

export default function AdminEntityForms({ entity, options }: CommonProps) {
  if (entity === "specialty") {
    return <SpecialtyForm />;
  }

  if (entity === "subject") {
    return <SubjectForm options={options} />;
  }

  if (entity === "teacher") {
    return <TeacherForm />;
  }

  if (entity === "classroom") {
    return <ClassroomForm />;
  }

  if (entity === "class") {
    return <ClassForm options={options} />;
  }

  return <FrameForm />;
}