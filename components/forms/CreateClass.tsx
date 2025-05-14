"use client";

import React, { useTransition, useActionState, useState, useEffect } from "react";
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
  Card,
  Title,
  Text,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  FormActionType,
  ManageFormServerProps,
  SyllabusInputForm,
} from "@/types/FormActionType";
import { redirect } from "next/navigation";
import { Classes, ID } from "@/types/databaseTypes";
import { createClass } from "@/app/[locale]/(tenancy)/_actions/createClass";
import { useStore } from "@/store/store";
import { IconTrash, IconUsers } from "@tabler/icons-react";
import { useTenancyBasedFormResponse } from "@/lib/hooks/useFormResponse";
import { Entities } from "@/types/Entities";

const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

interface ClassesInput extends ManageFormServerProps {
  entity?: Classes;
  formTitle?: string;
  formDescription?: string;
  error?: string;
}

interface SyllabusInput {
  occurrence: number;
  teachers: ID[];
}

interface SyllabusData {
  [subject: ID]: SyllabusInput;
}

interface SyllabusApiResponse {
  SUBJECT_ID: ID;
  TEACHERS: ID[];
  OCCURRENCE: number;
}

export const CreateClass: React.FC<ClassesInput> = ({
  entity,
  error,
  backBtnUrl,
  backBtnText,
  submitBtnText,
  toastMessage,
  formTitle = "Create New Class",
  formDescription = "Fill in the details to add a new class to your organization.",
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
    field: keyof SyllabusInput
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
      className: entity?.NAME || "",
      numberOfStudents: entity?.NUMBER_OF_STUDENTS?.toString() || "",
      id: entity?.ID || null,
      syllabus: {} // This will be managed by the syllabus state
    },
    validate: {
      className: (value) =>
        value.trim().length === 0 ? "Class name is required" : null,
      numberOfStudents: (value) =>
        value.trim().length === 0 ? "Number of students is required" : null,
    },
  });

  // Initialize syllabus state with entity data if in edit mode
  useEffect(() => {
    if (entity?.ID && subjects) {
      // Fetch syllabus data for this class
      const loadSyllabusData = async () => {
        try {
          const res = await fetch(`/api/syllabus/${entity.ID}`);
          const syllabusData: SyllabusApiResponse[] = await res.json();
          
          // Transform the data into our SyllabusData format
          const initialSyllabus: SyllabusData = {};
          syllabusData.forEach((item: SyllabusApiResponse) => {
            initialSyllabus[item.SUBJECT_ID] = {
              teachers: item.TEACHERS || [],
              occurrence: item.OCCURRENCE || 0
            };
          });
          
          setSyllabus(initialSyllabus);
        } catch (error) {
          console.error("Failed to load syllabus data:", error);
        }
      };

      loadSyllabusData();
    }
  }, [entity?.ID, subjects]);

  useTenancyBasedFormResponse(
    state,
    entity?.ID ? null : classForm,
    toastMessage,
    Entities.class,
    () => setSyllabus({})
  );

  const handleClassSubmit = (values: typeof classForm.values) => {
    const filteredSyllabus = Object.entries(syllabus)
      .filter(([_subject, { occurrence }]) => occurrence > 0)
      .reduce((acc, [subject, syll]) => ({
        ...acc,
        [subject]: {
          ...syll,
          subject: Number(subject) // Add the subject ID here
        }
      }), {});

    values.syllabus = filteredSyllabus;
    console.log("VALUES::", values);

    startTransition(() => {
      action(values);
    });
  };

  const handleAddSubject = (subject: string) => {
    setSyllabus((prev) => ({
      ...prev,
      [subject]: {
        teachers: [],
        occurrence: 0
      },
    }));
  };

  return (
    <Card shadow="md" radius="lg" p="xl" withBorder style={{ maxWidth: 600, margin: "auto" }}>
      <Group mb="md" align="center">
        <IconUsers size={32} color="var(--mantine-color-cambridge-6)" />
        <div>
          <Title order={2} c="taupe">{formTitle}</Title>
          <Text c="dimmed" size="sm">{formDescription}</Text>
        </div>
      </Group>
      <Divider mb="md" />
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
            placeholder="How many students?"
            {...classForm.getInputProps("numberOfStudents")}
            required
          />
          <Select
            label="Choose subject"
            placeholder="Select a subject here"
            value={null}
            data={Object.values(subjects || {}).filter(
              (subject) => !syllabus[subject.ID]
            )}
            onChange={(inputValue) =>
              inputValue && handleAddSubject(inputValue)
            }
          />
          {Object.entries(syllabus).map(([keyString, value]) => {
            const key = Number(keyString);
            return (
              <Group key={key} mt="md">
                <div>{subjects?.[key]?.NAME}</div>
                <NumberInput
                  label="Occurrence per week"
                  placeholder="Occurrence per week"
                  value={value.occurrence || 0}
                  onChange={(inputValue) =>
                    handleSubjectChange(key, inputValue, "occurrence")
                  }
                />
                {teachers && (
                  <MultiSelect
                    searchable
                    clearable
                    data={Object.values(teachers)}
                    label="Teacher"
                    placeholder="Select teacher(s)"
                    value={value.teachers}
                    onChange={(inputValue) =>
                      handleSubjectChange(key, inputValue, "teachers")
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
        </Stack>
      </form>
    </Card>
  );
};

export default CreateClass;
