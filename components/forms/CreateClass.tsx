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
  ActionIcon,
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
import { useStore } from "@/store/store";
import { IconTrash } from "@tabler/icons-react";

const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

interface ClassesInput extends ManageFormServerProps {
  entity?: Classes;
  error?: string;
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
  const {
    tenancyBasedData: {
      teachers: { data: teachers },
      subjects: { data: subjects },
    },
  } = useStore();

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
      .filter(([_subject, { occurrence }]) => occurrence > 0)
      .reduce((acc, [subject, syll]) => ({ ...acc, [subject]: syll }), {});
    values.syllabus = filteredSyllabus;

    startTransition(() => {
      action(values);
    });
  };

  const handleAddSubject = (subject: string) => {
    setSyllabus((prev) => ({
      ...prev,
      [subject]: {
        teacher: "",
        occurrence: 0,
      },
    }));
  };

  console.log("SYLLABUS::", syllabus);
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
          <Select
            label="Choose subject"
            data={Object.values(subjects || {})}
            onChange={(inputValue) =>
              inputValue && handleAddSubject(inputValue)
            }
          />
          <Group mt="md">
            {Object.entries(syllabus).map(([keyString, value]) => {
              const key = Number(keyString);
              return (
                <Group key={key} mt="md">
                  <div> {subjects?.[Number(key)]?.NAME}</div>
                  <NumberInput
                    label="Occurrence per week"
                    placeholder="Occurrence per week"
                    value={syllabus[Number(key)]?.occurrence || 0}
                    onChange={(inputValue) =>
                      handleSubjectChange(Number(key), inputValue, "occurrence")
                    }
                  />
                  {teachers && (
                    <MultiSelect
                      searchable
                      clearable
                      data={Object.values(teachers)}
                      label="Teacher"
                      placeholder="Select teacher(s)"
                      onChange={(inputValue) =>
                        handleSubjectChange(Number(key), inputValue, "teachers")
                      }
                    />
                  )}
                  <ActionIcon
                    onClick={() => {
                      const newSyllabus = { ...syllabus };
                      delete newSyllabus[key];
                      setSyllabus(newSyllabus);
                    }}
                  >
                    <IconTrash />
                  </ActionIcon>
                </Group>
              );
            })}
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
