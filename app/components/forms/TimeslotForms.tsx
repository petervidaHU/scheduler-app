import { Button, Group, NumberInput, Select, Stack, Tabs, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { useSubmit } from "react-router";
import type {
  TimeslotListItem,
  TimeslotOptions,
} from "../../lib/services/timeslots/manageTimeslots.server";

type Props = {
  options: TimeslotOptions;
  timeslots: TimeslotListItem[];
};

type OptionsOnlyProps = {
  options: TimeslotOptions;
};

function SingleTimeslotForm({ options }: OptionsOnlyProps) {
  const submit = useSubmit();
  const defaultFrameId = options.frames[0]?.value ?? "";
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      mode: "single",
      frameId: defaultFrameId,
      dayOfWeek: "1",
      startHour: 8,
      startMinutePart: 0,
      endHour: 8,
      endMinutePart: 45,
      subjectId: "",
      teacherId: "",
      classroomId: "",
      classId: "",
    },
    validate: {
      frameId: (value) => (value.trim().length === 0 ? "Frame is required" : null),
      endHour: (value, values) => {
        const start = values.startHour * 60 + values.startMinutePart;
        const end = value * 60 + values.endMinutePart;
        return end <= start ? "End time must be after start time" : null;
      },
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          formData.set(key, String(value));
        });
        formData.set("intent", "create");
        submit(formData, { method: "post" });
      })}
    >
      <Stack gap="sm">
        <Select
          label="Frame"
          placeholder="Select frame"
          data={options.frames}
          key={form.key("frameId")}
          {...form.getInputProps("frameId")}
        />
        <Select
          label="Day of week"
          data={[
            { value: "1", label: "1" },
            { value: "2", label: "2" },
            { value: "3", label: "3" },
            { value: "4", label: "4" },
            { value: "5", label: "5" },
            { value: "6", label: "6" },
            { value: "7", label: "7" },
          ]}
          key={form.key("dayOfWeek")}
          {...form.getInputProps("dayOfWeek")}
        />
        <Group grow>
          <NumberInput
            label="Start hour"
            min={0}
            max={23}
            key={form.key("startHour")}
            {...form.getInputProps("startHour")}
          />
          <NumberInput
            label="Start minute"
            min={0}
            max={59}
            step={5}
            key={form.key("startMinutePart")}
            {...form.getInputProps("startMinutePart")}
          />
        </Group>
        <Group grow>
          <NumberInput
            label="End hour"
            min={0}
            max={23}
            key={form.key("endHour")}
            {...form.getInputProps("endHour")}
          />
          <NumberInput
            label="End minute"
            min={0}
            max={59}
            step={5}
            key={form.key("endMinutePart")}
            {...form.getInputProps("endMinutePart")}
          />
        </Group>
        <Select
          label="Subject"
          placeholder="Optional"
          clearable
          data={options.subjects}
          key={form.key("subjectId")}
          {...form.getInputProps("subjectId")}
        />
        <Select
          label="Teacher"
          placeholder="Optional"
          clearable
          data={options.teachers}
          key={form.key("teacherId")}
          {...form.getInputProps("teacherId")}
        />
        <Select
          label="Classroom"
          placeholder="Optional"
          clearable
          data={options.classrooms}
          key={form.key("classroomId")}
          {...form.getInputProps("classroomId")}
        />
        <Select
          label="Class"
          placeholder="Optional"
          clearable
          data={options.classes}
          key={form.key("classId")}
          {...form.getInputProps("classId")}
        />
        <Group justify="flex-end">
          <Button type="submit">Create timeslot</Button>
        </Group>
      </Stack>
    </form>
  );
}

function TemplateTimeslotForm({ options }: OptionsOnlyProps) {
  const submit = useSubmit();
  const defaultFrameId = options.frames[0]?.value ?? "";
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      mode: "template",
      frameId: defaultFrameId,
      dayOfWeek: "1",
      startHour: 8,
      startMinutePart: 0,
      slotLength: 45,
      slotCount: 6,
      subjectId: "",
      teacherId: "",
      classroomId: "",
      classId: "",
    },
    validate: {
      frameId: (value) => (value.trim().length === 0 ? "Frame is required" : null),
      slotLength: (value) => (value < 1 ? "Slot length must be positive" : null),
      slotCount: (value) => (value < 1 || value > 20 ? "Slot count must be 1-20" : null),
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          formData.set(key, String(value));
        });
        formData.set("intent", "create");
        submit(formData, { method: "post" });
      })}
    >
      <Stack gap="sm">
        <Select
          label="Frame"
          placeholder="Select frame"
          data={options.frames}
          key={form.key("frameId")}
          {...form.getInputProps("frameId")}
        />
        <Select
          label="Day of week"
          data={[
            { value: "1", label: "1" },
            { value: "2", label: "2" },
            { value: "3", label: "3" },
            { value: "4", label: "4" },
            { value: "5", label: "5" },
            { value: "6", label: "6" },
            { value: "7", label: "7" },
          ]}
          key={form.key("dayOfWeek")}
          {...form.getInputProps("dayOfWeek")}
        />
        <Group grow>
          <NumberInput
            label="Start hour"
            min={0}
            max={23}
            key={form.key("startHour")}
            {...form.getInputProps("startHour")}
          />
          <NumberInput
            label="Start minute"
            min={0}
            max={59}
            step={5}
            key={form.key("startMinutePart")}
            {...form.getInputProps("startMinutePart")}
          />
        </Group>
        <Group grow>
          <NumberInput
            label="Slot length (minutes)"
            min={1}
            key={form.key("slotLength")}
            {...form.getInputProps("slotLength")}
          />
          <NumberInput
            label="Number of slots"
            min={1}
            max={20}
            key={form.key("slotCount")}
            {...form.getInputProps("slotCount")}
          />
        </Group>
        <Select
          label="Subject"
          placeholder="Optional"
          clearable
          data={options.subjects}
          key={form.key("subjectId")}
          {...form.getInputProps("subjectId")}
        />
        <Select
          label="Teacher"
          placeholder="Optional"
          clearable
          data={options.teachers}
          key={form.key("teacherId")}
          {...form.getInputProps("teacherId")}
        />
        <Select
          label="Classroom"
          placeholder="Optional"
          clearable
          data={options.classrooms}
          key={form.key("classroomId")}
          {...form.getInputProps("classroomId")}
        />
        <Select
          label="Class"
          placeholder="Optional"
          clearable
          data={options.classes}
          key={form.key("classId")}
          {...form.getInputProps("classId")}
        />
        <Group justify="flex-end">
          <Button type="submit">Create template timeslots</Button>
        </Group>
      </Stack>
    </form>
  );
}

function EditTimeslotForm({ options, timeslots }: Props) {
  const submit = useSubmit();
  const defaultTimeslot = timeslots[0] ?? null;
  const [selectedId, setSelectedId] = useState(defaultTimeslot?.id ?? "");
  const form = useForm({
    mode: "controlled",
    initialValues: {
      timeslotId: defaultTimeslot?.id ?? "",
      frameId: defaultTimeslot?.frameId ?? options.frames[0]?.value ?? "",
      dayOfWeek: String(defaultTimeslot?.dayOfWeek ?? 1),
      startHour: defaultTimeslot ? Math.floor(defaultTimeslot.startMinute / 60) : 8,
      startMinutePart: defaultTimeslot ? defaultTimeslot.startMinute % 60 : 0,
      endHour: defaultTimeslot ? Math.floor(defaultTimeslot.endMinute / 60) : 8,
      endMinutePart: defaultTimeslot ? defaultTimeslot.endMinute % 60 : 45,
      subjectId: defaultTimeslot?.subjectId ?? "",
      teacherId: defaultTimeslot?.teacherId ?? "",
      classroomId: defaultTimeslot?.classroomId ?? "",
      classId: defaultTimeslot?.classId ?? "",
    },
    validate: {
      timeslotId: (value) => (value.trim().length === 0 ? "Select a timeslot" : null),
      frameId: (value) => (value.trim().length === 0 ? "Frame is required" : null),
      endHour: (value, values) => {
        const start = values.startHour * 60 + values.startMinutePart;
        const end = value * 60 + values.endMinutePart;
        return end <= start ? "End time must be after start time" : null;
      },
    },
  });

  const timeslotOptions = timeslots.map((item) => ({
    value: item.id,
    label: `${item.id} - day ${item.dayOfWeek} (${String(Math.floor(item.startMinute / 60)).padStart(2, "0")}:${String(item.startMinute % 60).padStart(2, "0")})`,
  }));

  useEffect(() => {
    if (!selectedId || timeslots.length === 0) {
      return;
    }

    const selected = timeslots.find((item) => item.id === selectedId);
    if (!selected) {
      return;
    }

    form.setValues({
      timeslotId: selected.id,
      frameId: selected.frameId,
      dayOfWeek: String(selected.dayOfWeek),
      startHour: Math.floor(selected.startMinute / 60),
      startMinutePart: selected.startMinute % 60,
      endHour: Math.floor(selected.endMinute / 60),
      endMinutePart: selected.endMinute % 60,
      subjectId: selected.subjectId ?? "",
      teacherId: selected.teacherId ?? "",
      classroomId: selected.classroomId ?? "",
      classId: selected.classId ?? "",
    });
  }, [selectedId, timeslots]);

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          formData.set(key, String(value));
        });
        formData.set("intent", "update");
        submit(formData, { method: "post" });
      })}
    >
      <Stack gap="sm">
        <Select
          label="Timeslot"
          placeholder="Select timeslot"
          data={timeslotOptions}
          key={form.key("timeslotId")}
          {...form.getInputProps("timeslotId")}
          onChange={(value) => {
            const next = value ?? "";
            setSelectedId(next);
            form.setFieldValue("timeslotId", next);
          }}
        />
        <Select
          label="Frame"
          placeholder="Select frame"
          data={options.frames}
          key={form.key("frameId")}
          {...form.getInputProps("frameId")}
        />
        <Select
          label="Day of week"
          data={[
            { value: "1", label: "1" },
            { value: "2", label: "2" },
            { value: "3", label: "3" },
            { value: "4", label: "4" },
            { value: "5", label: "5" },
            { value: "6", label: "6" },
            { value: "7", label: "7" },
          ]}
          key={form.key("dayOfWeek")}
          {...form.getInputProps("dayOfWeek")}
        />
        <Group grow>
          <NumberInput
            label="Start hour"
            min={0}
            max={23}
            key={form.key("startHour")}
            {...form.getInputProps("startHour")}
          />
          <NumberInput
            label="Start minute"
            min={0}
            max={59}
            step={5}
            key={form.key("startMinutePart")}
            {...form.getInputProps("startMinutePart")}
          />
        </Group>
        <Group grow>
          <NumberInput
            label="End hour"
            min={0}
            max={23}
            key={form.key("endHour")}
            {...form.getInputProps("endHour")}
          />
          <NumberInput
            label="End minute"
            min={0}
            max={59}
            step={5}
            key={form.key("endMinutePart")}
            {...form.getInputProps("endMinutePart")}
          />
        </Group>
        <Select
          label="Subject"
          placeholder="Optional"
          clearable
          data={options.subjects}
          key={form.key("subjectId")}
          {...form.getInputProps("subjectId")}
        />
        <Select
          label="Teacher"
          placeholder="Optional"
          clearable
          data={options.teachers}
          key={form.key("teacherId")}
          {...form.getInputProps("teacherId")}
        />
        <Select
          label="Classroom"
          placeholder="Optional"
          clearable
          data={options.classrooms}
          key={form.key("classroomId")}
          {...form.getInputProps("classroomId")}
        />
        <Select
          label="Class"
          placeholder="Optional"
          clearable
          data={options.classes}
          key={form.key("classId")}
          {...form.getInputProps("classId")}
        />
        <Group justify="flex-end">
          <Button type="submit">Update timeslot</Button>
        </Group>
      </Stack>
    </form>
  );
}

export default function TimeslotForms({ options, timeslots }: Props) {
  return (
    <Tabs defaultValue="single">
      <Tabs.List>
        <Tabs.Tab value="single">Single timeslot</Tabs.Tab>
        <Tabs.Tab value="template">Timeslot template</Tabs.Tab>
        <Tabs.Tab value="edit">Edit timeslot</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="single" pt="md">
        <SingleTimeslotForm options={options} />
      </Tabs.Panel>

      <Tabs.Panel value="template" pt="md">
        <TemplateTimeslotForm options={options} />
      </Tabs.Panel>

      <Tabs.Panel value="edit" pt="md">
        <EditTimeslotForm options={options} timeslots={timeslots} />
      </Tabs.Panel>
    </Tabs>
  );
}