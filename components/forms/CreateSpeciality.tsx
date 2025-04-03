"use client";

import React, { useTransition, useActionState } from "react";
import {
  Container,
  Title,
  Tabs,
  TextInput,
  Button,
  Group,
  Stack,
  Select,
  NumberInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { FormActionType } from "@/types/FormActionType";
import { Speciality } from "@/types/databaseTypes";
import { redirect } from "next/navigation";
import { manageSpeciality } from "@/app/[locale]/(tenancy)/_actions/manageSpeciality";

const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

interface props {
  entity?: Speciality
}

export const CreateSpeciality: React.FC<props> = ({entity}) => {
  console.log("entity", entity)
  const [isPending, startTransition] = useTransition();
  const [specialityState, specialityAction] = useActionState(manageSpeciality, {
    ...init,
  });

  const specialityForm = useForm({
    initialValues: {
      id: entity?.SPECIALTY_ID || null,
      specialityName: entity?.SPECIALTY_NAME ||"",
      description: entity?.DESCRIPTION || "",
    },
    validate: {
      specialityName: (value) =>
        value.trim().length === 0 ? "Subject name is required" : null,
    },
  });

  const handleSpecialityFormSubmit = (values: typeof specialityForm.values) => {
    startTransition(() => {
      specialityAction(values);
    });
  };

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
            <Button disabled={isPending} type="submit">Create speciality</Button>
          </Group>
        </Stack>
      </form>
      <Button onClick={() => redirect("/my-tenancy/admin")}>Cancel</Button>
    </Container>
  );
};

export default CreateSpeciality;
