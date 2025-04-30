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

export const CreateTeacher: FC<ManageFormServerProps<Teacher>> = ({
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
      teacherName: (value) =>
        value.trim().length === 0 ? "teacher name is required" : null,
      teacherEmail: (value) =>
        value.trim().length === 0 ? "teacher name is required" : null,
    },
  });

  const { manageState } = useTenancyBasedFormResponse(
    state,
    entity.ID ? null : teacherForm,
    toastMessage,
    Entities.teacher
  );
  manageState()

  const handleTeacherFormSubmit = (values: typeof teacherForm.values) => {
    startTransition(() => {
      action(values);
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
              Create teacher
            </Button>
          </Group>
        </Stack>
      </form>
      <Button onClick={() => redirect("/my-tenancy/admin")}>Cancel</Button>
    </Container>
  );
};

export default CreateTeacher;
