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
  Card,
  Title,
  Text,
  Divider,
  SimpleGrid,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { FormActionType, ManageFormServerProps } from "@/types/FormActionType";
import { redirect } from "next/navigation";
import { Frame, ErrorResponse } from "@/types/databaseTypes";
import { manageFrame } from "@/app/[locale]/(tenancy)/_actions/manageFrame";
import { useTenancyBasedFormResponse } from "@/lib/hooks/useFormResponse";
import { useStore } from "@/store/store";
import { Entities } from "@/types/Entities";
import { IconCalendar } from "@tabler/icons-react";

const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

interface FrameInput extends ManageFormServerProps {
  entity?: Frame;
  error?: string;
  formTitle?: string;
  formDescription?: string;
}

export const CreateFrame: FC<FrameInput> = ({
  entity,
  error,
  backBtnUrl,
  backBtnText,
  submitBtnText,
  toastMessage,
  formTitle = "Create New Frame",
  formDescription = "Fill in the details to add a new frame to your organization.",
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

  // Define a success handler callback
  const handleSuccess = React.useCallback(() => {
    console.log('Frame created successfully');
    // Any additional cleanup can be done here
  }, []);

  useTenancyBasedFormResponse(
    frameState,
    entity?.ID ? null : frameForm, // reset form only on create
    toastMessage,
    Entities.frame,
    handleSuccess
  );

  const handleFrameSubmit = (values: typeof frameForm.values) => {
    console.log("Submitting frame values:", values);
    
    // Use destructuring to prepare data
    const { name, recurrence, numberOfDays, description, id } = values;
    
    // Create a copy to avoid direct mutation and transform data as needed
    const submissionValues = {
      name,
      recurrence: recurrence ? 1 : 0,
      numberOfDays,
      description,
      id
    };
    
    // Use transition to avoid re-renders during form submission
    startTransition(() => {
      console.log('Submitting form with values:', submissionValues);
      frameAction(submissionValues);
    });
  };

  if (error) return (
    <Container size="md" my="xl">
      <p>{error}</p>
    </Container>
  );

  return (
    <Card shadow="md" radius="lg" p="xl" withBorder style={{ maxWidth: 1000, width: "90vw", margin: "32px auto" }}>
      <Group mb="md" align="center">
        <IconCalendar size={32} color="var(--mantine-color-cambridge-6)" />
        <div>
          <Title order={2} c="taupe">{formTitle}</Title>
          <Text c="dimmed" size="sm">{formDescription}</Text>
        </div>
      </Group>
      <Divider mb="md" />
      {specialties.error && <p>{specialties.error}</p>}
      {specialties.isLoading && <p>Loading specialties</p>}
      <form onSubmit={frameForm.onSubmit(handleFrameSubmit)}>
        <SimpleGrid cols={2} spacing="md" visibleFrom="lg">
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
        </SimpleGrid>
        <Group mt="md">
          <Button disabled={isPending} type="submit">
            {submitBtnText}
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
            {backBtnText}
          </Button>
        </Group>
      </form>
    </Card>
  );
};