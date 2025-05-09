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
  } from "@mantine/core";
import { useForm } from "@mantine/form";
import { FormActionType, ManageFormServerProps } from "@/types/FormActionType";
import { redirect } from "next/navigation";
import { Subject,  } from "@/types/databaseTypes";
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
  entity?: Subject,
  error?: string,
  backBtnUrl: string,
  backBtnText: string,
  submitBtnText: string,
}


export const CreateSubject: FC<SubjectInput> = ({ 
  entity,
  error,
  backBtnUrl,
  backBtnText,
  submitBtnText,
  toastMessage,
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

  useTenancyBasedFormResponse(
    subjectState,
    entity?.ID ? null : subjectForm,
    toastMessage || 'Subject action successful',
    Entities.subject
  );

  const handleSubjectSubmit = (values: typeof subjectForm.values) => {
    startTransition(() => {
      const submissionValues = {
        ...values,
        helperColor: values.helperColor || defaultHelperColor,
      };
      subjectAction(submissionValues);
    });
  };

    if (error) return (
      <Container size="md" my="xl">
        <p>{error}</p>
      </Container>
    );

  return (
    <Container size="md" my="xl">
      {specialties.isLoading && (<p>loading specialities</p>)}
      <form onSubmit={subjectForm.onSubmit(handleSubjectSubmit)}>
        <Stack>
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
          <ColorPicker
            format="hsl"
            value={subjectForm.values.helperColor}
            onChange={(color) => subjectForm.setFieldValue('helperColor', color)}
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

export default CreateSubject;
