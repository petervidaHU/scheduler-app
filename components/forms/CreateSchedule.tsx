"use client";

import { useForm } from "@mantine/form";
import {
  NumberInput,
  Select,
  Textarea,
  Button,
  Checkbox,
  TextInput,
} from "@mantine/core";
import { createSchedule, ScheduleContext } from "@/app/[locale]/(tenancy)/my-tenancy/schedules/_actions/createSchedule";
import { FormActionType } from "@/types/FormActionType";
import { useActionState, useTransition } from "react";
import { useStore } from "@/store/store";
import { nanoid } from "nanoid";
import { getSyllabusAction } from "@/app/[locale]/(tenancy)/my-tenancy/schedules/_actions/getSyllabusAction";
import { FormFields } from "@/types/ScheduleTypes";

const formFields = Object.values(FormFields);

const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

const SchedulePage = () => {
  const {
    tenancyBasedData: {
      teachers: { data: teachers },
      classes: { data: classes },
      classRooms: { data: classRooms },
      subjects: { data: subjects },
      frames: { data: frames },
    },
    addDay,
    updateSyllabus,
    updateSchedule,
    scheduleState: { days, lessons },
  } = useStore();
  const [isPending, startTransition] = useTransition();
  const [sState, sAction] = useActionState(createSchedule, {
    ...init,
  });

  const updateScheduleState = (
    values: Record<FormFields, any>,
    previous: Record<FormFields, any>
  ) => {
    formFields.forEach((element) => {
      if (values[element] !== previous[element]) {
        updateSchedule({ [element]: values[element] });
      }
    });
  };

  const classOptions = Object.entries(classes || {}).map(([id, classObj]) => ({
    value: id,
    label: `${classObj.NAME} / (${classObj.NUMBER_OF_STUDENTS} students)`,
  }));

  const frameOptions = Object.entries(frames || {}).map(([id, frameObj]) => ({
    value: id,
    label: `${frameObj.NAME} (${frameObj.RECURRENCE === 1 ? 'Recurring' : 'Non-recurring'}, ${frameObj.NUMBER_OF_DAYS} days)`,
  }));

  const form = useForm({
    initialValues: {
      [FormFields.name]: "",
      [FormFields.class]: "",
      [FormFields.description]: "",
      [FormFields.owner]: "",
      [FormFields.status]: "",
      frameId: "",
      variations: "",
    },
    validate: {
      class: (value) => (!value ? "Class is required" : null),
      frameId: (value) => (!value ? "Frame is required" : null),
    },
    onValuesChange: async (values, previous) => {
      updateScheduleState(values, previous);
      
      // If class changed and name is empty, populate it
      if (values.class !== previous.class && values.class) {
        const selectedClass = classes?.[values.class];
        if (selectedClass && !values.name) {
          form.setFieldValue(FormFields.name, `Weekly schedule for ${selectedClass.NAME}`);
        }
      }

      if (values.class !== form.values.class && values.class !== "") {
        const newSyllabus = await getSyllabusAction(Number(values.class));

        if (!newSyllabus) {
          return;
        }

        updateSyllabus(newSyllabus);
      }

      // Update frameId in store
      if (values.frameId !== previous.frameId) {
        updateSchedule({ frameId: values.frameId ? Number(values.frameId) : null });
      }
    },
  });

  const handleScheduleFormSubmit = (values: typeof form.values) => {
    if (!values.class || !values.frameId) {
      return;
    }
    const scheduleContext: ScheduleContext = {
      frameId: Number(values.frameId),
      days: days,
      lessons: lessons,
      name: values.name,
      class: Number(values.class),
      description: values.description,
      owner: values.owner || "",
    };
    startTransition(() => {
      sAction(scheduleContext);
    });
  };

  const handleWeeklyCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // TODO: implement weekly plan
    console.log("to be done");
  };

  const handleAddDay = (event: React.MouseEvent<HTMLButtonElement>) => {
    const newDay = {
      id: nanoid(),
      timeSlots: [],
    };
    addDay(newDay);
  };

  return (
    <>
      <form onSubmit={form.onSubmit(handleScheduleFormSubmit)}>
        <Checkbox
          label="weekly schedule"
          name="weekly"
          onChange={handleWeeklyCheckboxChange}
        />
        <Button onClick={handleAddDay}>add day</Button>

        <Select
          label="Class"
          name={FormFields.class}
          data={classOptions}
          value={form.values.class}
          onChange={(value) => form.setFieldValue(FormFields.class, value || "")}
          required
        />
        
        <Select
          label="Frame"
          name="frameId"
          data={frameOptions}
          value={form.values.frameId}
          onChange={(value) => form.setFieldValue("frameId", value || "")}
          placeholder="Select a frame"
          required
        />
        
        <TextInput
          label="Name"
          name={FormFields.name}
          value={form.values.name}
          onChange={(event) => form.setFieldValue(FormFields.name, event.currentTarget.value)}
        />
        <TextInput
          label="Owner"
          name={FormFields.owner}
          value={form.values.owner}
          onChange={(event) => form.setFieldValue(FormFields.owner, event.currentTarget.value)}
        />
  
        <Textarea
          label="Description"
          name={FormFields.description}
          value={form.values.description}
          onChange={(event) => form.setFieldValue(FormFields.description, event.currentTarget.value)}
        />
        <Button type="submit">Create Schedule</Button>
      </form>
    </>
  );
};

export default SchedulePage;
