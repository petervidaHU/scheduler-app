"use client";

import React, { useTransition, useActionState, FC } from "react";
import { Container, TextInput, Button, Group, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { FormActionType, ManageFormServerProps } from "@/types/FormActionType";
import { Specialty } from "@/types/databaseTypes";
import { redirect } from "next/navigation";
import { manageSpeciality } from "@/app/[locale]/(tenancy)/_actions/manageSpeciality";
import { useTenancyBasedFormResponse } from "@/lib/hooks/useFormResponse";
import { Entities } from "@/types/Entities";
import AddBasicEntities from "./AddBasicEntities";

const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

interface SpecialtyInput extends ManageFormServerProps {
  entity?: Specialty;
  error?: string;
}

export const CreateSpeciality: FC<SpecialtyInput> = ({
  entity,
  error,
  backBtnUrl,
  backBtnText,
  submitBtnText,
  toastMessage,
}) => {
  const [isPending, startTransition] = useTransition();
  const [specialityState, specialityAction] = useActionState(manageSpeciality, {
    ...init,
  });

  const specialityForm = useForm({
    initialValues: {
      id: entity?.ID || null,
      specialityName: entity?.NAME || "",
      description: entity?.DESCRIPTION || "",
    },
    validate: {
      specialityName: (value) =>
        value.trim().length === 0 ? "Speciality name is required" : null,
    },
  });

  // Define a success handler callback
  const handleSuccess = React.useCallback(() => {
    console.log("Specialty created successfully");
    // Any additional cleanup can be done here
  }, []);

  useTenancyBasedFormResponse(
    specialityState,
    entity?.ID ? null : specialityForm,
    toastMessage,
    Entities.specialty,
    handleSuccess
  );

  const handleSpecialityFormSubmit = (values: typeof specialityForm.values) => {
    console.log("Submitting specialty values:", values);

    // Create a copy to avoid direct mutation
    const submissionValues = { ...values };

    // Use transition to avoid re-renders during form submission
    startTransition(() => {
      console.log("Submitting form with values:", submissionValues);
      specialityAction(submissionValues);
    });
  };

  if (error)
    return (
      <Container size="md" my="xl">
        <p>{error}</p>
      </Container>
    );
console.log('back button url:', backBtnUrl);
  console.log('back button text:', backBtnText);
  return (
    <Container size="md" my="xl">
      <form onSubmit={specialityForm.onSubmit(handleSpecialityFormSubmit)}>
        <Stack>
          <TextInput
            label="Speciality Name"
            placeholder="Enter speciality name"
            {...specialityForm.getInputProps("specialityName")}
            required
          />
          <TextInput
            label="Description"
            placeholder="description, not mandatory"
            {...specialityForm.getInputProps("description")}
            required
          />
          <Group mt="md">
            <Button disabled={isPending} type="submit">
              {submitBtnText || "Create Specialty"}
            </Button>
            <Button
              variant="outline"
              color="gray"
              onClick={() => redirect(backBtnUrl)}
            >
              {backBtnText || "Cancel"}
            </Button>
          </Group>
        </Stack>
      </form>
      <AddBasicEntities entityType={Entities.specialty} />
    </Container>
  );
};

export default CreateSpeciality;
