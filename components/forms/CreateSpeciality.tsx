"use client";

import React, { useTransition, useActionState, FC } from "react";
import {
  Container,
  TextInput,
  Button,
  Group,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { FormActionType, ManageFormServerProps } from "@/types/FormActionType";
import { Specialty } from "@/types/databaseTypes";
import { redirect } from "next/navigation";
import { manageSpeciality } from "@/app/[locale]/(tenancy)/_actions/manageSpeciality";
import { useFormResponse } from "@/lib/hooks/useFormResponse";
import { Entities } from "@/types/Entities";
import AddBasicEntities from "./AddBasicEntities";

const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

interface SpecialtyInput extends ManageFormServerProps {
  entity?: Specialty;
  error?: string,
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

  const { manageState } = useFormResponse(
    specialityState,
    entity?.ID ? null : specialityForm,
    toastMessage,
    Entities.specialty
  );
  manageState();

  const handleSpecialityFormSubmit = (values: typeof specialityForm.values) => {
    startTransition(() => {
      specialityAction(values);
    });
  };

    if (error) return (
      <Container size="md" my="xl">
        <p>{error}</p>
      </Container>
    );

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
              {submitBtnText}
            </Button>
          </Group>
        </Stack>
      </form>
      <Button onClick={() => redirect(backBtnUrl)}>{backBtnText}</Button>
      <AddBasicEntities entityType={Entities.specialty}/>
    </Container>
  );
};

export default CreateSpeciality;
