"use client";

import React, { useTransition, useActionState, FC } from "react";
import { Container, TextInput, Button, Group, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { FormActionType, ManageFormServerProps } from "@/types/FormActionType";
import { redirect } from "next/navigation";
import { createTeacher } from "@/app/[locale]/(tenancy)/_actions/createTeacher";
import { Teacher } from "@/types/databaseTypes";
import { useTenancyBasedFormResponse } from "@/lib/hooks/useFormResponse";
import { Entities } from "@/types/Entities";

const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

interface CreateTeacherProps extends ManageFormServerProps {
  entity?: Teacher;
}

export const CreateTeacher: FC<CreateTeacherProps> = ({
  entity,
  backBtnUrl,
  backBtnText,
  submitBtnText,
  toastMessage,
}) => {
  const [isPending, startTransition] = useTransition();
  const [state, action] = useActionState(createTeacher, {
    ...init,
  });

  const teacherForm = useForm({
    mode: "controlled",
    initialValues: {
      teacherName: entity?.NAME || "",
      teacherEmail: entity?.EMAIL || "",
      description: entity?.DESCRIPTION || "",
    },
    validate: {
      teacherName: (value: string) =>
        value.trim().length === 0 ? "teacher name is required" : null,
      teacherEmail: (value: string) =>
        value.trim().length === 0 ? "teacher email is required" : null,
    },
  });

  // Define a success handler callback
  const handleSuccess = React.useCallback(() => {
    console.log('Teacher created successfully');
    // Any additional cleanup can be done here
  }, []);

  useTenancyBasedFormResponse(
    state,
    entity?.ID ? null : teacherForm,
    toastMessage,
    Entities.teacher,
    handleSuccess
  );

  const handleTeacherFormSubmit = (values: typeof teacherForm.values) => {
    console.log("Submitting teacher values:", values);
    
    // Create a copy to avoid direct mutation
    const submissionValues = { ...values };
    
    // Use transition to avoid re-renders during form submission
    startTransition(() => {
      console.log('Submitting form with values:', submissionValues);
      action(submissionValues);
    });
  };

  return (
    <Container size="md" my="xl">
      <div>{JSON.stringify(state)}</div>
      <form onSubmit={teacherForm.onSubmit(handleTeacherFormSubmit)}>
        <Stack>
          <TextInput
            key={teacherForm.key("teacherName")}
            label="Teacher Name"
            placeholder="Enter teacher name"
            {...teacherForm.getInputProps("teacherName")}
            required
          />
          <TextInput
            key={teacherForm.key("teacherEmail")}
            label="Teacher email"
            placeholder="Enter teacher's email"
            {...teacherForm.getInputProps("teacherEmail")}
            required
          />
          <TextInput
            key={teacherForm.key("description")}
            label="Description"
            placeholder="description, not mandatory"
            {...teacherForm.getInputProps("description")}
          />
          <Group mt="md">
            <Button disabled={isPending} type="submit">
              {submitBtnText || "Create Teacher"}
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

export default CreateTeacher;
