"use client";

import React, { useTransition, useActionState, use, useEffect } from "react";
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
import { useStore } from "@/store/store";

const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

interface props {
  entity?: Speciality;
}

export const CreateSpeciality: React.FC<props> = ({ entity }) => {
  // console.log("entity", entity)
  const { addToast } = useStore();
  const [isPending, startTransition] = useTransition();
  const [specialityState, specialityAction] = useActionState(manageSpeciality, {
    ...init,
  });

  const specialityForm = useForm({
    initialValues: {
      id: entity?.SPECIALTY_ID || null,
      specialityName: entity?.SPECIALTY_NAME || "",
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

  useEffect(() => {
    if (specialityState.success === true) {
      specialityForm.reset();
      specialityState.success = false;
      const toastMessage = entity?.SPECIALTY_ID
        ? "Speciality updated successfully"
        : "Speciality created successfully";

      addToast({
        message: toastMessage,
        title: "Success",
        type: "success",
        autoClose: true,
        id: Date.now().toString(),
      });
    } else if (specialityState.error) {
      addToast({
        message: specialityState.error.message || "Something went wrong",
        title: "Error",
        type: "error",
        autoClose: true,
        id: Date.now().toString(),
      });
    }
  }, [specialityState]);

  return (
    <Container size="md" my="xl">
      {JSON.stringify(specialityState)}
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
              {entity ? "Update speciality" : "Create speciality"}
            </Button>
          </Group>
        </Stack>
      </form>
      <Button onClick={() => redirect("/my-tenancy/admin")}>Cancel</Button>
    </Container>
  );
};

export default CreateSpeciality;
