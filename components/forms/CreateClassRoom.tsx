"use client";

import React, { useTransition, useActionState } from "react";
import {
  Container,
  TextInput,
  Button,
  Group,
  Stack,
  Select,
  NumberInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { FormActionType } from "@/types/FormActionType";
import { redirect } from "next/navigation";
import { Speciality } from "@/types/databaseTypes";
import { createClassRoom } from "@/app/[locale]/(tenancy)/_actions/createClassRoom";

const init: FormActionType = {
  error: null,
  data: null,
  success: false
  };

interface props {
  specialities: Speciality[],
}

export const CreateClassRoom: React.FC<props> = ({specialities}) => {
  const [ isPending, startTransition ] = useTransition();
  const [crState, crAction] = useActionState(createClassRoom, {
    ...init,
  });

  const classRoomForm = useForm({
    initialValues: {
      name: "",
      specialityId: null,
      description: "",
      capacity: 0,
    },
    validate: {
      capacity: (value) =>
        value <= 0 ? "Classroom capacity must be largen than 0" : null,
      specialityId: (value) => (!value ? "must select speciality" : null),
    },
  });

  const handleClassRoomSubmit = (values: typeof classRoomForm.values) => {
    startTransition(() => {
      crAction(values);
    });
  };

  return (
    <Container size="md" my="xl">
      <form onSubmit={classRoomForm.onSubmit(handleClassRoomSubmit)}>
        <Stack>
          <TextInput
            label="Room Name"
            placeholder="Enter class name"
            {...classRoomForm.getInputProps("name")}
            required
          />
          <TextInput
            label="Description"
            placeholder="Short description of the room"
            {...classRoomForm.getInputProps("description")}
          />
          <NumberInput
            label="Capacity"
            placeholder="Enter capacity larger than zero"
            min={1}
            step={1}
            {...classRoomForm.getInputProps("capacity")}
          />
          <Select
            label="Select a speciality"
            placeholder="Select a speciality"
            data={specialities.map((speciality) => ({
              value: speciality.SPECIALTY_ID.toString(),
              label: speciality.SPECIALTY_NAME,
            }))}
            {...classRoomForm.getInputProps("specialityId")}
          />
          <Group mt="md">
            <Button disabled={isPending} type="submit">Create Classroom</Button>
          </Group>
        </Stack>
      </form>
      <Button onClick={() => redirect("/my-tenancy/admin")}>Cancel</Button>
    </Container>
  );
};

export default CreateClassRoom;
