"use client";

import React, { FC, useTransition, useActionState } from "react";
import {
  Container,
  TextInput,
  Button,
  Group,
  Stack,
  Select,
  ColorPicker,
  Card,
  Title,
  Text,
  Divider,
  SimpleGrid,
} from "@mantine/core";
import { IconBook } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { FormActionType, ManageFormServerProps } from "@/types/FormActionType";
import { redirect } from "next/navigation";
import { Subject } from "@/types/databaseTypes";
import { useTenancyBasedFormResponse } from "@/lib/hooks/useFormResponse";
import { Entities } from "@/types/Entities";
import { useStore } from "@/store/store";
import { manageSubject } from "@/app/[locale]/(tenancy)/_actions/createSubject";

const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

interface SubjectInput extends ManageFormServerProps {
  entity?: Subject;
  error?: string;
  formTitle?: string;
  formDescription?: string;
  backBtnUrl: string;
  backBtnText: string;
  submitBtnText: string;
}

export const CreateSubject: FC<SubjectInput> = ({ 
  entity,
  error,
  backBtnUrl,
  backBtnText,
  submitBtnText,
  toastMessage,
  formTitle = "Create New Subject",
  formDescription = "Fill in the details to add a new subject to your organization.",
 }) => {
  const { tenancyBasedData: { specialties }} = useStore();
  const [isPending, startTransition] = useTransition();
  const [subjectState, subjectAction] = useActionState(manageSubject, {
    ...init,
  });

  const defaultHelperColor = "#FFFFFF";

  const subjectForm = useForm({
    initialValues: {
      name: entity?.NAME || "",
      specialtyId: entity?.SPECIALTY_ID || null,
      description: entity?.DESCRIPTION || "",
      helperColor: entity?.HELPER_COLOR || defaultHelperColor,
      id: entity?.ID || null,
    },
    validate: {
      name: (value: string) => (value === "" ? "Subject name must be valid" : null),
    },
  });

  // Define a success handler callback
  const handleSuccess = React.useCallback(() => {
    // Any additional cleanup can be done here
  }, []);

  useTenancyBasedFormResponse(
    subjectState,
    entity?.ID ? null : subjectForm,
    toastMessage || 'Subject action successful',
    Entities.subject,
    handleSuccess
  );

  const handleSubjectSubmit = (values: typeof subjectForm.values) => {
    // Create a copy to avoid direct mutation
    const submissionValues = {
      ...values,
      helperColor: values.helperColor || defaultHelperColor,
    };
    
    // Use transition to avoid re-renders during form submission
    startTransition(() => {
      subjectAction(submissionValues);
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
        <IconBook size={32} color="var(--mantine-color-cambridge-6)" />
        <div>
          <Title order={2} c="taupe">{formTitle}</Title>
          <Text c="dimmed" size="sm">{formDescription}</Text>
        </div>
      </Group>
      <Divider mb="md" />
      {specialties.isLoading && (<p>loading specialities</p>)}
      <form onSubmit={subjectForm.onSubmit(handleSubjectSubmit)}>
        <SimpleGrid cols={2} spacing="md" visibleFrom="lg">
          <TextInput
            label="Subject Name"
            placeholder="Enter subject name"
            {...subjectForm.getInputProps("name")}
            required
          />
          <TextInput
            label="Description"
            placeholder="Short description of the subject"
            {...subjectForm.getInputProps("description")}
          />
          <Select
            label="Select a speciality"
            placeholder="Select a speciality"
            data={Object.values(specialties?.data || {}).map((speciality) => ({
              value: speciality.ID.toString(),
              label: speciality.NAME,
            }))}
            {...subjectForm.getInputProps("specialtyId")}
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

export default CreateSubject;
