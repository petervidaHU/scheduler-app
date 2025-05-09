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
import { DayPlan } from "@/types/ScheduleTypes";
import { useEffect } from "react";

const formFields = Object.values(FormFields);

// Special value for custom frame
const CUSTOM_FRAME = "CUSTOM";

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
    deleteDay,
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

  // Add Custom Frame option to the frame options
  const frameOptions = [
    { value: CUSTOM_FRAME, label: "Custom Frame (Manual day creation)" },
    ...Object.entries(frames || {}).map(([id, frameObj]) => ({
      value: id,
      label: `${frameObj.NAME} (${frameObj.RECURRENCE === 1 ? 'Recurring' : 'Non-recurring'}, ${frameObj.NUMBER_OF_DAYS} days)`,
    }))
  ];

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
        updateSchedule({ frameId: values.frameId });

        // Handle frame change - update days based on the frame's NUMBER_OF_DAYS
        if (values.frameId && values.frameId !== CUSTOM_FRAME) {
          const selectedFrame = frames?.[values.frameId];
          if (selectedFrame) {
            updateDaysBasedOnFrame(selectedFrame.NUMBER_OF_DAYS);
          }
        } else if (values.frameId === CUSTOM_FRAME) {
          // For custom frame, clear existing days but don't auto-create new ones
          days.forEach(day => {
            deleteDay(day.id);
          });
        }
      }
    },
  });

  // Function to update days based on the frame's NUMBER_OF_DAYS property
  const updateDaysBasedOnFrame = (numberOfDays: number) => {
    // First, clear existing days
    days.forEach(day => {
      deleteDay(day.id);
    });

    // Then, create the required number of days
    for (let i = 0; i < numberOfDays; i++) {
      const newDay: DayPlan = {
        id: nanoid(),
        order: String(i + 1),
        identifier: `Day ${i + 1}`,
        timeSlots: [],
        lessons: [],
      };
      addDay(newDay);
    }
  };

  // Update days if frameId is already set when component mounts
  useEffect(() => {
    const frameId = form.values.frameId;
    if (frameId && frameId !== CUSTOM_FRAME && frames?.[frameId]) {
      updateDaysBasedOnFrame(frames[frameId].NUMBER_OF_DAYS);
    }
  }, [frames]);

  const handleAddDay = (event: React.MouseEvent<HTMLButtonElement>) => {
    const newDay: DayPlan = {
      id: nanoid(),
      order: String(days.length + 1),
      identifier: `Day ${days.length + 1}`,
      timeSlots: [],
      lessons: [],
    };
    addDay(newDay);
  };

  const handleScheduleFormSubmit = (values: typeof form.values) => {
    if (!values.class || !values.frameId) {
      return;
    }

    const scheduleContext: ScheduleContext = {
      frameId: values.frameId === CUSTOM_FRAME ? CUSTOM_FRAME : Number(values.frameId),
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

  return (
    <>
      <form onSubmit={form.onSubmit(handleScheduleFormSubmit)}>
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

        {/* Show Add Day button only when Custom Frame is selected */}
        {form.values.frameId === CUSTOM_FRAME && (
          <Button onClick={handleAddDay} mt="sm" mb="sm">
            Add Day
          </Button>
        )}

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
