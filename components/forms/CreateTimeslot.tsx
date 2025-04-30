"use client";

import React, { FC } from "react";
import { useStore } from "@/store/store";
import {
  Button,
  Fieldset,
  Group,
  NumberInput,
  Text,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";

interface props {}

const CreateTimeslot: FC<props> = () => {
  const { addActiveTimeslot } = useStore();

  const timeslotForm = useForm({
    initialValues: {
      name: "",
      description: "",
      startTimeHour: 0,
      startTimeMinute: 0,
      endTimeHour: 0,
      endTimeMinute: 0,
    },
    validate: (values) => {
      const startTime = values.startTimeHour * 60 + values.startTimeMinute;
      const endTime = values.endTimeHour * 60 + values.endTimeMinute;
      if (endTime - startTime === 0) {
        return {
          __error: "Duration must be more than 0 minutes",
        };
      }
      if (startTime >= endTime) {
        return {
          __error: "End time must be after start time",
        };
      }
      return {};
    },
    onValuesChange(values, previous) {
      if (
        values.endTimeHour !== previous.endTimeHour ||
        values.endTimeMinute !== previous.endTimeMinute ||
        values.startTimeHour !== previous.startTimeHour ||
        values.startTimeMinute !== previous.startTimeMinute
      )
        timeslotForm.clearErrors();
    },
  });

  const getTimeInMinutes = (hour: number, minute: number) => {
    return hour * 60 + minute;
  };

  const handleSubmit = (values: typeof timeslotForm.values) => {
    addActiveTimeslot({
      ID: new Date().getTime(),
      NAME: values.name,
      DESCRIPTION: values.description,
      PERIOD_START: getTimeInMinutes(
        values.startTimeHour,
        values.startTimeMinute
      ),
      PERIOD_END: getTimeInMinutes(values.endTimeHour, values.endTimeMinute),
    });
    timeslotForm.reset();
  };

  return (
    <form onSubmit={timeslotForm.onSubmit(handleSubmit)}>
      <Group mt="md">
        <Fieldset legend="Start time">
          <NumberInput
            label="hour"
            min={0}
            max={23}
            defaultValue={0}
            allowDecimal={false}
            clampBehavior="strict"
            stepHoldDelay={300}
            stepHoldInterval={100}
            {...timeslotForm.getInputProps("startTimeHour")}
          />
          <NumberInput
            label="minute"
            min={0}
            max={59}
            defaultValue={0}
            allowDecimal={false}
            clampBehavior="strict"
            stepHoldDelay={300}
            stepHoldInterval={100}
            {...timeslotForm.getInputProps("startTimeMinute")}
          />
        </Fieldset>
        <Fieldset legend="End time">
          <NumberInput
            label="hour"
            min={0}
            max={23}
            defaultValue={0}
            allowDecimal={false}
            clampBehavior="strict"
            stepHoldDelay={300}
            stepHoldInterval={100}
            {...timeslotForm.getInputProps("endTimeHour")}
          />
          <NumberInput
            label="minute"
            min={0}
            max={59}
            defaultValue={0}
            allowDecimal={false}
            clampBehavior="strict"
            stepHoldDelay={300}
            stepHoldInterval={100}
            {...timeslotForm.getInputProps("endTimeMinute")}
          />
        </Fieldset>
        <Stack>
          <TextInput label="name" {...timeslotForm.getInputProps("name")} />
          <TextInput
            label="description"
            {...timeslotForm.getInputProps("description")}
          />
        </Stack>
        <Stack>
          <Text>Duration: TBD</Text>
          <Button type="submit">create timeslot</Button>
        </Stack>
      </Group>
      {timeslotForm.errors.__error && (
        <div style={{ color: "red" }}>{timeslotForm.errors.__error}</div>
      )}
    </form>
  );
};

export default CreateTimeslot;
