"use client";

import React, { useTransition, useActionState, FC } from "react";
import {
  Container,
  TextInput,
  Button,
  Group,
  Stack,
  NumberInput,
  Switch,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { FormActionType, ManageFormServerProps } from "@/types/FormActionType";
import { redirect } from "next/navigation";
import { Frame, ErrorResponse } from "@/types/databaseTypes";
import { manageFrame } from "@/app/[locale]/(tenancy)/_actions/manageFrame";
import { useTenancyBasedFormResponse } from "@/lib/hooks/useFormResponse";
import { useStore } from "@/store/store";
import { Entities } from "@/types/Entities";

const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

interface FrameInput extends ManageFormServerProps {
  entity?: Frame;
  error?: string,
}

export const CreateFrame: FC<FrameInput> = ({
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
  const [frameState, frameAction] = useActionState(manageFrame, {
    ...init,
  });

  const frameForm = useForm({
    initialValues: {
      name: entity?.NAME || "",
      recurrence: entity?.RECURRENCE === 1,
      numberOfDays: entity?.NUMBER_OF_DAYS || 1,
      description: entity?.DESCRIPTION || "",
      id: entity?.ID || null,
    },
    validate: {
      numberOfDays: (value) =>
        !value || value < 1 ? "Number of days must be at least 1" : null,
    },
  });

  const { manageState } = useTenancyBasedFormResponse(
    frameState,
    entity?.ID ? null : frameForm, // reset form only on create
    toastMessage,
    Entities.frame
  );
  manageState();

  const handleFrameSubmit = (values: typeof frameForm.values) => {
    const { name, recurrence, numberOfDays, description, id } = values;
    startTransition(() => {
      frameAction({
        name,
        recurrence: recurrence ? 1 : 0,
        numberOfDays,
        description,
        id
      });
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
      {specialties.isLoading && <p>Loading specialties</p>}
      <form onSubmit={frameForm.onSubmit(handleFrameSubmit)}>
        <Stack>
          <TextInput
            label="Frame Name"
            placeholder="Enter frame name"
            {...frameForm.getInputProps("name")}
            required
          />
          <Textarea
            label="Description"
            placeholder="Enter frame description"
            {...frameForm.getInputProps("description")}
          />
          <Switch
            label="Recurrence"
            {...frameForm.getInputProps("recurrence", { type: "checkbox" })}
          />
          <NumberInput
            label="Number of Days"
            placeholder="Enter number of days"
            min={1}
            {...frameForm.getInputProps("numberOfDays")}
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
    </Container>
  );
}; 