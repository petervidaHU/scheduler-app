"use client";

import React, { useTransition, useActionState, FC } from "react";
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
import { ClassRoom, ErrorResponse } from "@/types/databaseTypes";
import { manageClassRoom } from "@/app/[locale]/(tenancy)/_actions/manageClassRoom";
import { useTenancyBasedFormResponse } from "@/lib/hooks/useFormResponse";
import { useStore } from "@/store/store";
import { Entities } from "@/types/Entities";

const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

interface ClassRoomInput extends ManageFormServerProps {
  entity?: ClassRoom;
  error?: string,
}

export const CreateClassRoom: FC<ClassRoomInput> = ({
  entity,
  error,
  backBtnUrl,
  backBtnText,
  submitBtnText,
  toastMessage,
}) => {
  const {
    tenancyBasedData: { specialties },
  } = useStore();
  const [isPending, startTransition] = useTransition();
  const [crState, crAction] = useActionState(manageClassRoom, {
    ...init,
  });

  const classRoomForm = useForm({
    initialValues: {
      name: entity?.NAME || "",
      specialityId: entity?.SPECIALITY_ID || null,
      description: entity?.DESCRIPTION || "",
      capacity: entity?.CAPACITY || 0,
      id: entity?.ID || null,
    },
    validate: {
      capacity: (value: number) =>
        value <= 0 ? "Classroom capacity must be larger than 0" : null,
      specialityId: (value: number | null) => (!value ? "must select speciality" : null),
    },
  });

  // Define a success handler callback
  const handleSuccess = React.useCallback(() => {
    console.log('Classroom created successfully');
    // Any additional cleanup can be done here
  }, []);

  useTenancyBasedFormResponse(
    crState,
    entity?.ID ? null : classRoomForm,
    toastMessage,
    Entities.classroom,
    handleSuccess
  );

  const handleClassRoomSubmit = (values: typeof classRoomForm.values) => {
    console.log("Submitting classroom values:", values);
    
    // Create a copy to avoid direct mutation
    const submissionValues = { ...values };
    
    // Use transition to avoid re-renders during form submission
    startTransition(() => {
      console.log('Submitting form with values:', submissionValues);
      crAction(submissionValues);
    });
  };

  if (error) return (
    <Container size="md" my="xl">
      <p>{error}</p>
    </Container>
  );

  return (
    <Container size="md" my="xl">
      {specialties.error && <p>{specialties.error}</p>}
      {specialties.isLoading && <p>Loading specialities</p>}
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
            data={Object.values(specialties?.data || {})}
            {...classRoomForm.getInputProps("specialityId")}
            value={classRoomForm.values.specialityId?.toString()}
          />
          <Group mt="md">
            <Button disabled={isPending} type="submit">
              {submitBtnText || "Create Classroom"}
            </Button>
            <Button 
              onClick={() => {
                if (backBtnUrl) {
                  window.location.href = backBtnUrl;
                } else {
                  window.location.href = "/my-tenancy/admin";
                }
              }} 
              variant="outline"
              color="gray"
            >
              {backBtnText || "Cancel"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Container>
  );
};

export default CreateClassRoom;
