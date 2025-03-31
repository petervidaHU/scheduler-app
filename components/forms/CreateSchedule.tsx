"use client";

import { useForm } from "@mantine/form";
import { NumberInput, Select, Textarea, Button, Checkbox } from "@mantine/core";
import { createSchedule } from "@/app/[locale]/(tenancy)/my-tenancy/schedules/_actions/createSchedule";
import { FormActionType } from "@/types/FormActionType";
import { useActionState, useTransition, useState } from "react";
import { Classes, ClassRoom, Teacher } from "@/types/databaseTypes";
import { useStore } from "@/store/store";
import { nanoid } from "nanoid";
import { getSyllabusAction } from "@/app/[locale]/(tenancy)/my-tenancy/schedules/_actions/getSyllabusAction";

const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

interface props {
  data: {
    classRooms: ClassRoom[];
    teachers: Teacher[];
    classes: Classes[];
  };
}

const SchedulePage: React.FC<props> = ({
  data: { classRooms, teachers, classes },
}) => {
  const { addDay, updateSyllabus } = useStore();
  const [isPending, startTransition] = useTransition();
  const [sState, sAction] = useActionState(createSchedule, {
    ...init,
  });

  const classOptions = classes.map((c) => ({
    value: c.CLASS_ID.toString(),
    label: `${c.CLASS_NAME} (${c.NUMBER_OF_STUDENTS} students)`,
  }));

  const form = useForm({
    initialValues: {
      class: "",
      description: "",
      owner: null,
    },
    validate: {
      owner: (value) => (!value ? "Owner is required" : null),
    },
    onValuesChange: async (values) => {
      if (values.class !== form.values.class && values.class !== "") {
        const newSyllabus = await getSyllabusAction(values.class);
        console.log("change", newSyllabus);
        updateSyllabus(newSyllabus);
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
          name="class"
          data={classOptions}
          {...form.getInputProps("class")}
        />
        <NumberInput
          label="Variations"
          name="variations"
          {...form.getInputProps("variations")}
        />
        <Textarea
          label="Description"
          name="description"
          {...form.getInputProps("description")}
        />
        <Button type="submit">Create Schedule</Button>
      </form>
    </>
  );
};

export default SchedulePage;
