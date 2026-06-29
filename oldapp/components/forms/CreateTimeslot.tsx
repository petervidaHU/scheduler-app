"use client";

import React, { FC, useState } from "react";
import { useStore } from "@/store/store";
import {
  Button,
  Fieldset,
  Group,
  NumberInput,
  Text,
  Stack,
  TextInput,
  Switch,
} from "@mantine/core";
import { useForm } from "@mantine/form";

interface props {
  timeslotId: number | null;
  overlappingAccepted: boolean;
  onSubmit?: (values: any) => void;
  startTimeHour?: number;
  startTimeMinute?: number;
}

export const getTimeInMinutes = (hour: number, minute: number) => {
  return hour * 60 + minute;
};

export const getHour = (time: number | undefined) => {
  if (!time) return 0;
  return Math.floor(time / 60);
};

export const getMinute = (time: number | undefined) => {
  if (!time) return 0;
  return time % 60;
};

const CreateTimeslot: FC<props> = ({
  timeslotId,
  overlappingAccepted = true,
  onSubmit,
  startTimeHour,
  startTimeMinute,
}) => {
  const { addActiveTimeslot, selectActiveTimeslot, activeTimeslots } =
    useStore();
  const [checked, setChecked] = useState<boolean>(!!timeslotId);
  const timeslot = timeslotId ? selectActiveTimeslot(timeslotId) : null;

  const timeslotForm = useForm({
    initialValues: {
      id: timeslotId || new Date().getTime(),
      name: timeslot?.NAME || "",
      description: timeslot?.DESCRIPTION || "",
      startTimeHour: typeof startTimeHour === 'number' ? startTimeHour : (getHour(timeslot?.PERIOD_START) || 0),
      startTimeMinute: typeof startTimeMinute === 'number' ? startTimeMinute : (getMinute(timeslot?.PERIOD_START) || 0),
      endTimeHour: getHour(timeslot?.PERIOD_END) || 0,
      endTimeMinute: getMinute(timeslot?.PERIOD_END) || 0,
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

      // overlapping timeslots
      if (
        overlappingAccepted === false &&
        Object.values(activeTimeslots).some(
          (t) =>
            t.ID !== timeslotId &&
            t.PERIOD_START < endTime &&
            t.PERIOD_END > startTime
        )
      ) {
        return {
          __error: "Timeslots cannot overlap",
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

  const handleAddDuration = (duration: number) => () => {
    const startTime =
      timeslotForm.values.startTimeHour * 60 +
      timeslotForm.values.startTimeMinute;
    const endTime = startTime + duration;
    timeslotForm.setValues({
      endTimeHour: getHour(endTime),
      endTimeMinute: getMinute(endTime),
    });
  };

  const clearForm = () => {
    timeslotForm.setValues({
      id: new Date().getTime(),
      name: "",
      description: "",
      startTimeHour: 0,
      startTimeMinute: 0,
      endTimeHour: 0,
      endTimeMinute: 0,
    });
  };

  const handleEditMode = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.checked === false) {
      clearForm();
    } else {
      timeslotForm.reset();
    }
    setChecked(event.currentTarget.checked);
  };

  const handleSubmit = (values: typeof timeslotForm.values) => {
    if (onSubmit) {
      onSubmit(values);
    } else {
      addActiveTimeslot({
        ID: values.id,
        NAME: values.name,
        DESCRIPTION: values.description,
        PERIOD_START: getTimeInMinutes(
          values.startTimeHour,
          values.startTimeMinute
        ),
        PERIOD_END: getTimeInMinutes(values.endTimeHour, values.endTimeMinute),
      });
      clearForm();
    }
  };

  return (
    <form onSubmit={timeslotForm.onSubmit(handleSubmit)}>
      {timeslotId && (
        <Switch
          checked={checked}
          onChange={(event) => {
            handleEditMode(event);
          }}
          label={`Editing mode: ${timeslotId}`}
        />
      )}
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
        <Stack>
          <Button onClick={handleAddDuration(45)}>+45 min</Button>
          <Button onClick={handleAddDuration(60)}>+1 hour</Button>
        </Stack>
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
