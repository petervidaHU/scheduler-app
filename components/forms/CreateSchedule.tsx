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
import { createSchedule } from "@/app/[locale]/(tenancy)/my-tenancy/schedules/_actions/createSchedule";
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
    tenancyBasedData: { teachers, classes, classRooms, subjects },
    addDay,
    updateSyllabus,
    updateSchedule,
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

  const classOptions = Object.entries(classes).map(([id, classObj]) => ({
    value: id,
    label: `${classObj.CLASS_NAME} / (${classObj.NUMBER_OF_STUDENTS} students)`,
  }));

  const form = useForm({
    initialValues: {
      [FormFields.name]: "",
      [FormFields.class]: "",
      [FormFields.description]: "",
      [FormFields.owner]: null,
      [FormFields.status]: null,
    },
    validate: {
      owner: (value) => (!value ? "Owner is required" : null),
      name: (value) => (!value ? "Owner is required" : null),
    },
    onValuesChange: async (values, previous) => {
      updateScheduleState(values, previous);
      if (values.class !== form.values.class && values.class !== "") {
        const newSyllabus = await getSyllabusAction(values.class);

        if (!newSyllabus) {
          return;
        }
        console.log("newSyllabus", newSyllabus);

        // updateSyllabus(syllabusMapping(newSyllabus));
        updateSyllabus({
          classId: Number(values.class),
          subjects: newSyllabus,
        });
      }
    },
  });

  const handleScheduleFormSubmit = (values: typeof form.values) => {
    startTransition(() => {
      sAction(values);
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

  console.log(sState);

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
          {...form.getInputProps(FormFields.class)}
        />
        <TextInput
          label="Name"
          name={FormFields.name}
          {...form.getInputProps(FormFields.name)}
        />
        <NumberInput
          label="Variations"
          name="variations"
          {...form.getInputProps("variations")}
        />
        <Textarea
          label="Description"
          name={FormFields.description}
          {...form.getInputProps(FormFields.description)}
        />
        <Button type="submit">Create Schedule</Button>
      </form>
    </>
  );
};

export default SchedulePage;
