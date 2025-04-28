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
import { FormActionType, ManageFormServerProps } from "@/types/FormActionType";
import { redirect } from "next/navigation";
import { ClassRoom, Specialty } from "@/types/databaseTypes";
import { manageClassRoom } from "@/app/[locale]/(tenancy)/_actions/manageClassRoom";
import { useFormResponse } from "@/lib/hooks/useFormResponse";

const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

interface props extends ManageFormServerProps<ClassRoom> {
  specialities: Specialty[];
}

export const CreateClassRoom: React.FC<props> = ({
  specialities,
  entity,
  backBtnUrl,
  backBtnText,
  submitBtnText,
  toastMessage,
}) => {
  const [isPending, startTransition] = useTransition();
  const [crState, crAction] = useActionState(manageClassRoom, {
    ...init,
  });

  const classRoomForm = useForm({
    initialValues: {
      name: entity.CLASSROOM_NAME || "",
      specialityId: entity.SPECIALITY_ID || null,
      // TODO description ?
      description: "",
      capacity: entity.CAPACITY || 0,
      id: entity.CLASSROOM_ID || null,
    },
    validate: {
      capacity: (value) =>
        value <= 0 ? "Classroom capacity must be largen than 0" : null,
      specialityId: (value) => (!value ? "must select speciality" : null),
    },
  });

  console.log("entit", entity, classRoomForm.values);
  const { manageState } = useFormResponse(crState, classRoomForm, toastMessage);
  manageState();

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
            value={classRoomForm.values.specialityId?.toString()}
          />
          <Group mt="md">
            <Button disabled={isPending} type="submit">
              {submitBtnText}
            </Button>
          </Group>
        </Stack>
      </form>
      <Button onClick={() => redirect(backBtnUrl)}>{backBtnText}</Button>
    </Container>
  );
};

export default CreateClassRoom;
