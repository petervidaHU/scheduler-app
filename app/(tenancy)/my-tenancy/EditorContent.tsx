"use client";

import React, { startTransition, useActionState } from "react";
import {
  Container,
  Title,
  Tabs,
  TextInput,
  Button,
  Group,
  Stack,
  Select,
  NumberInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { createTeacher } from "../_actions/createTeacher";
import { FormActionType } from "@/types/FormActionType";
import { createClass } from "../_actions/createClass";
import { createSubject } from "../_actions/createSubject";
import { createSpeciality } from "../_actions/createSpeciality";
import { Speciality } from "@/types/databaseTypes";
import { createClassRoom } from "../_actions/createClassRoom";

const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

export const EditorContent = ({
  tenancyId,
  specialities,
}: {
  tenancyId: string;
  specialities: Speciality[];
}) => {
  console.log("speciality:", specialities);
  const [teacherState, teacherAction] = useActionState(createTeacher, {
    ...init,
  });
  const [classState, classAction] = useActionState(createClass, { ...init });
  const [subjectState, subjectAction] = useActionState(createSubject, {
    ...init,
  });
  const [classRoomState, classRoomAction] = useActionState(createClassRoom, {
    ...init,
  });
  const [specialityState, specialityAction] = useActionState(createSpeciality, {
    ...init,
  });
  const teacherForm = useForm({
    initialValues: {
      name: "",
      email: "",
      metadata: "",
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? "Name is required" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

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

  const subjectForm = useForm({
    initialValues: {
      subjectName: "",
      description: "",
      requiresSpecialRoom: null,
    },
    validate: {
      subjectName: (value) =>
        value.trim().length === 0 ? "Subject name is required" : null,
    },
  });

  const classRoomForm = useForm({
    initialValues: {
      name: "",
      specialityId: null,
      description: "",
      capacity: 0,
    },
    validate: {
      capacity: (value) =>
        value <= 0 ? "Classroom capacity must be largen than 0" : null,
      specialityId: (value) => (!value ? "must select speciality" : null),
    },
  });

  const specialityForm = useForm({
    initialValues: {
      specialityName: "",
      description: "",
    },
    validate: {
      specialityName: (value) =>
        value.trim().length === 0 ? "Subject name is required" : null,
    },
  });

  const handleTeacherSubmit = (values: typeof teacherForm.values) => {
    startTransition(() => {
      teacherAction(values);
    });
    console.log("Teacher form submitted:", values);
  };

  const handleClassSubmit = (values: typeof classForm.values) => {
    startTransition(() => {
      classAction(values);
    });
  };

  const handleSpecialityFormSubmit = (values: typeof specialityForm.values) => {
    startTransition(() => {
      specialityAction(values);
    });
  };

  const handleSubjectSubmit = (values: typeof subjectForm.values) => {
    startTransition(() => {
      subjectAction(values);
    });
  };



  return (
    <Container size="md" my="xl">
      <Title order={2} mb="xl">
        Upload Tenancy Data
      </Title>
      <Tabs defaultValue="teachers">
        <Tabs.List>
          <Tabs.Tab value="teachers">Teachers</Tabs.Tab>
          <Tabs.Tab value="classes">Classes</Tabs.Tab>
          <Tabs.Tab value="subjects">Subjects</Tabs.Tab>
          <Tabs.Tab value="speciality">Specialities for Classrooms</Tabs.Tab>
          <Tabs.Tab value="classroom">Classrooms</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="teachers" pt="md">
          <form onSubmit={teacherForm.onSubmit(handleTeacherSubmit)}>
            <Stack>
              <TextInput
                label="Teacher Name"
                placeholder="Enter teacher name"
                {...teacherForm.getInputProps("name")}
                required
              />
              <TextInput
                label="Teacher Email"
                placeholder="teacher@example.com"
                {...teacherForm.getInputProps("email")}
                required
              />
              <TextInput
                label="Additional Metadata"
                placeholder="E.g., phone, certifications"
                {...teacherForm.getInputProps("metadata")}
              />
              <Group mt="md">
                <Button type="submit">Upload Teacher</Button>
              </Group>
            </Stack>
          </form>
        </Tabs.Panel>

        <Tabs.Panel value="speciality" pt="md">
          <form onSubmit={specialityForm.onSubmit(handleSpecialityFormSubmit)}>
            <Stack>
              <TextInput
                label="Speciality Name"
                placeholder="Enter speciality name"
                {...specialityForm.getInputProps("specialityName")}
                required
              />
              <TextInput
                label="Description"
                placeholder="teacher@example.com"
                {...specialityForm.getInputProps("description")}
                required
              />
              <Group mt="md">
                <Button type="submit">Upload Teacher</Button>
              </Group>
            </Stack>
          </form>
        </Tabs.Panel>

        <Tabs.Panel value="classes" pt="md">
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
              <Group mt="md">
                <Button type="submit">Upload Class</Button>
              </Group>
            </Stack>
          </form>
        </Tabs.Panel>

        <Tabs.Panel value="subjects" pt="md">
          <form onSubmit={subjectForm.onSubmit(handleSubjectSubmit)}>
            <Stack>
              <TextInput
                label="Subject Name"
                placeholder="Enter subject name"
                {...subjectForm.getInputProps("subjectName")}
                required
              />
              <TextInput
                label="Description"
                placeholder="Short description of the subject"
                {...subjectForm.getInputProps("description")}
              />
              {/* You could add a checkbox here if you need to indicate special classroom requirements */}
              <Group mt="md">
                <Button type="submit">Upload Subject</Button>
              </Group>
            </Stack>
          </form>
        </Tabs.Panel>

        <Tabs.Panel value="classroom" pt="md">
          <form onSubmit={classRoomForm.onSubmit(handleClassRoomSubmit)}>
            <Stack>
              <TextInput
                label="Room Name"
                placeholder="Enter class name"
                {...classRoomForm.getInputProps("name")}
                required
              />
              <TextInput
                label="Description"
                placeholder="Short description of the room"
                {...classRoomForm.getInputProps("description")}
              />
              <NumberInput
                label="Capacity"
                placeholder="Enter capacity larger than zero"
                min={1}
                step={1}
                {...classRoomForm.getInputProps("capacity")}
              />
              <Select
                label="Select a speciality"
                placeholder="Select a speciality"
                data={specialities.map((speciality) => ({
                  value: speciality.SPECIALTY_ID.toString(),
                  label: speciality.SPECIALTY_NAME,
                }))}
                {...classRoomForm.getInputProps("specialityId")}
              />
              <Group mt="md">
                <Button type="submit">Upload Subject</Button>
              </Group>
            </Stack>
          </form>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default EditorContent;
