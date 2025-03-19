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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { FormActionType } from "@/types/FormActionType";
import { redirect } from "next/navigation";
import { createClass } from "@/app/(tenancy)/_actions/createClass";
import { Subject } from "@/types/databaseTypes";

const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

interface props {
    subjectsList: Subject[];
}

export const CreateClass: React.FC<props> = ({subjectsList}) => {
    console.log('subjectsList', subjectsList)
  const [isPending, startTransition] = useTransition();
  const [state, action] = useActionState(createClass, {
    ...init,
  });
  const [subjects, setSubjects] = useState([
    { subjectName: '', occurrencePerWeek: 0 },
  ]);

  const handleAddSubject = () => {
    setSubjects([...subjects, { subjectName: '', occurrencePerWeek: 0 }]);
  };

  const handleSubjectChange = (index, field, value) => {
    setSubjects(
      subjects.map((subject, i) => {
        if (i === index) {
          return { ...subject, [field]: value };
        }
        return subject;
      })
    );
  };


  const classForm = useForm({
    initialValues: {
      className: "",
      numberOfStudents: "",
    },
    validate: {
      className: (value) =>
        value.trim().length === 0 ? "Class name is required" : null,
      numberOfStudents: (value) =>
        value.trim().length === 0 ? "Class name is required" : null,
    },
  });

  const handleClassRoomSubmit = (values: typeof classForm.values) => {
    console.log("values", values);
    startTransition(() => {
      action(values);
    });
  };
  console.log("classroom state in editor", isPending, state);

  return (
    <Container size="md" my="xl">
      <form onSubmit={classForm.onSubmit(handleClassRoomSubmit)}>
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
          {subjects.map((subject, index) => (
        <Group key={index} mt="md">
          <Select
            label="Subject Name"
            placeholder="Subject Name"
            data={[
              { value: 'Math', label: 'Math' },
              { value: 'Science', label: 'Science' },
              // Add more subjects here
            ]}
            value={subject.subjectName}
            onChange={(value) => handleSubjectChange(index, 'subjectName', value)}
          />
          <NumberInput
            label="Occurrence per week"
            placeholder="Occurrence per week"
            value={subject.occurrencePerWeek}
            onChange={(value) => handleSubjectChange(index, 'occurrencePerWeek', value)}
          />
        </Group>
      ))}
      <Button onClick={handleAddSubject}>Add new subject</Button>
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
