"use client";

import React, { useTransition, useActionState, useState } from "react";
import {
  Container,
  TextInput,
  Button,
  Group,
  Stack,
  Select,
  NumberInput,
  MultiSelect,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  FormActionType,
  ManageFormServerProps,
  SelectOptions,
  SyllabusInputForm,
} from "@/types/FormActionType";
import { redirect } from "next/navigation";
import { Classes, ID } from "@/types/databaseTypes";
import { createClass } from "@/app/[locale]/(tenancy)/_actions/createClass";

const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

interface ClassesInput extends ManageFormServerProps {
  entity?: Classes;
  error?: string,
}

interface SyllabusData {
  [subject: ID]: SyllabusInputForm;
}

export const CreateClass: React.FC<ClassesInput> = ({
  entity,
  error,
  backBtnUrl,
  backBtnText,
  submitBtnText,
  toastMessage,
}) => {
  const [isPending, startTransition] = useTransition();
  const [state, action] = useActionState(createClass, {
    ...init,
  });
  const [syllabus, setSyllabus] = useState<SyllabusData>({});

  const handleSubjectChange = (
    subject: ID,
    value: unknown,
    field: keyof SyllabusInputForm
  ) => {
    setSyllabus((prev) => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [field]: value,
      },
    }));
  };

  const classForm = useForm({
    initialValues: {
      className: "",
      numberOfStudents: "",
      syllabus: {},
    },
    validate: {
      className: (value) =>
        value.trim().length === 0 ? "Class name is required" : null,
      numberOfStudents: (value) =>
        value.trim().length === 0 ? "Class name is required" : null,
    },
  });

  const handleClassSubmit = (values: typeof classForm.values) => {
    const filteredSyllabus = Object.entries(syllabus)
      .filter(([_subject, { occurence }]) => occurence > 0)
      .reduce((acc, [subject, syll]) => ({ ...acc, [subject]: syll }), {});
    values.syllabus = filteredSyllabus;

    startTransition(() => {
      action(values);
    });
  };

  // TODO update create / edit with state refetch logic

  return (
    <Container size="md" my="xl">
      <form onSubmit={classForm.onSubmit(handleClassSubmit)}>
        <Stack>
          <TextInput
            label="Class Name"
            placeholder="Enter class name"
            {...classForm.getInputProps("className")}
            required
          />
          <TextInput
            label="Number of students"
            placeholder="how many students there?"
            {...classForm.getInputProps("numberOfStudents")}
          />
          add syllabus
          <Group mt="md">
            {subjectsList.map((subject, index) => (
              <Group key={index} mt="md">
                <div> {subject.label}</div>
                <NumberInput
                  label="Occurrence per week"
                  placeholder="Occurrence per week"
                  value={
                    syllabus[subject.value as keyof SyllabusData]?.occurence ||
                    0
                  }
                  onChange={(inputValue) =>
                    handleSubjectChange(subject.value, inputValue, "occurence")
                  }
                />
                <MultiSelect
                  searchable
                  clearable
                  data={teachersList}
                  label="Teacher"
                  placeholder="Select teacher(s)"
                  onChange={(inputValue) =>
                    handleSubjectChange(subject.value, inputValue, "teachers")
                  }
                />
              </Group>
            ))}
          </Group>
          <Group mt="md">
            <Button disabled={isPending} type="submit">
              Create Class
            </Button>
          </Group>
        </Stack>
      </form>
      <Button onClick={() => redirect("/my-tenancy/admin")}>Cancel</Button>
    </Container>
  );
};

export default CreateClass;
