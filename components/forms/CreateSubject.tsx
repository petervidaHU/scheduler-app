"use client";

import React, { useTransition, useActionState } from "react";
import {
  Container,
  TextInput,
  Button,
  Group,
  Stack,
  Select,
  NumberInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { FormActionType } from "@/types/FormActionType";
import { redirect } from "next/navigation";
import { createClassRoom } from "@/app/(tenancy)/_actions/createClassRoom";
import { Speciality } from "@/types/databaseTypes";
import { createSubject } from "@/app/(tenancy)/_actions/createSubject";

const init: FormActionType = {
  error: null,
  data: null,
  success: false
  };

interface props {
  specialities: Speciality[],
}

export const CreateSubject: React.FC<props> = ({specialities}) => {
  const [ isPending, startTransition ] = useTransition();
  const [subjectState, subjectAction] = useActionState(createSubject, {
    ...init,
  });

  const subjectForm = useForm({
    initialValues: {
      name: "",
      specialityId: null,
      description: "",
    },
    validate: {
      name: (value) =>
        value === '' ? "Subject name must be valid" : null,
    },
  });

  const handleSubjectSubmit = (values: typeof subjectForm.values) => {
    console.log("values", values);
    startTransition(() => {
      subjectAction(values);
    });
  };
  console.log("classroom state in editor", isPending, subjectState);

  return (
    <Container size="md" my="xl">
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
            data={specialities.map((speciality) => ({
              value: speciality.SPECIALTY_ID.toString(),
              label: speciality.SPECIALTY_NAME,
            }))}
            {...subjectForm.getInputProps("specialityId")}
          />
          <Group mt="md">
            <Button disabled={isPending} type="submit">Create Subject</Button>
          </Group>
        </Stack>
      </form>
      <Button onClick={() => redirect("/my-tenancy/admin")}>Cancel</Button>
    </Container>
  );
};

export default CreateSubject;
