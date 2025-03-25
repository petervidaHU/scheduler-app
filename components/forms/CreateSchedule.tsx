"use client";

import { useForm } from "@mantine/form";
import { NumberInput, Select, Textarea, Button, Checkbox } from "@mantine/core";
import { createSchedule } from "@/app/[locale]/(tenancy)/my-tenancy/schedules/_actions/createSchedule";
import { FormActionType } from "@/types/FormActionType";
import { useActionState, useTransition, useState } from "react";
import { Classes, ClassRoom, Teacher } from "@/types/databaseTypes";
import SchedulePlanner from "../SchedulePlanner";
import { useStore } from "@/store/store";

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
  const store = useStore();
  //store.decreaseNumberOfDays();
  console.log("store", store);
  const [ numberOfDays, setNumberOfDays] = useState(0);
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
      days: 0,
      class: "",
      variations: 0,
      description: "",
      owner: null,
      weekly: false,
    },
    validate: {
      days: (value) => (value < 0 ? "Days must be positive" : null),
      variations: (value) =>
        value <= 0 ? "Variations must be positive" : null,
      owner: (value) => (!value ? "Owner is required" : null),
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
    if (event.target.checked) {
      form.setFieldValue("days", 5);
      form.setFieldValue("weekly", true);
    } else {
      form.setFieldValue("weekly", false);
    }
  };
  console.log(sState);

  return (<>
    <form onSubmit={form.onSubmit(handleScheduleFormSubmit)}>
      <Checkbox label="weekly schedule" name="weekly" onChange={handleWeeklyCheckboxChange} />
      <Button onClick={() => setNumberOfDays(prev => prev + 1)}>add day</Button>
     
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
    <SchedulePlanner 
    numberOfDays={numberOfDays}
    setter={(e:any) => {console.log('setter?', e)}}
    
    />
    </>
  );
};

export default SchedulePage;
