"use client";

import React, { useTransition, useActionState, FC, useEffect, useMemo, useState } from "react";
import { Container, TextInput, Button, Group, Stack, Select, NumberInput, Card, Title, Text, Divider } from "@mantine/core";
import { useForm } from "@mantine/form";
import { FormActionType, ManageFormServerProps } from "@/types/FormActionType";
import { redirect } from "next/navigation";
import { createTeacher } from "@/app/[locale]/(tenancy)/_actions/createTeacher";
import { Teacher } from "@/types/databaseTypes";
import { useTenancyBasedFormResponse } from "@/lib/hooks/useFormResponse";
import { Entities } from "@/types/Entities";
import { nanoid } from "nanoid";
import GridContainer from "../day-planner/GridContainer";
import HourGrid from "../day-planner/HourGrid";
import TimeslotsList from "../day-planner/TimeslotsList";
import { getOccupiedTimeslotsByTeacher } from "@/app/[locale]/(tenancy)/_actions/getOccupiedTimeslotsByTeacher";
import { useStore } from "../../store/store";
import { IconChalkboard } from "@tabler/icons-react";

const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

interface CreateTeacherProps extends ManageFormServerProps {
  entity?: Teacher;
  formTitle?: string;
  formDescription?: string;
}

export const CreateTeacher: FC<CreateTeacherProps> = ({
  entity,
  backBtnUrl,
  backBtnText,
  submitBtnText,
  toastMessage,
  formTitle = "Create New Teacher",
  formDescription = "Fill in the details to add a new teacher to your organization.",
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

  const { tenancyBasedData: { frames }, windowHeight } = useStore();
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const [occupiedTimeslots, setOccupiedTimeslots] = useState<any[]>([]);
  const [localDays, setLocalDays] = useState<any[]>([]);
  const isEditMode = !!entity?.ID;

  // Update local days when frame changes
  useEffect(() => {
    if (!selectedFrameId) {
      setLocalDays([]);
      return;
    }
    const frame = frames?.data?.[selectedFrameId];
    if (!frame) {
      setLocalDays([]);
      return;
    }
    const numberOfDays = frame.NUMBER_OF_DAYS;
    const daysArr: any[] = [];
    for (let i = 0; i < numberOfDays; i++) {
      daysArr.push({
        id: nanoid(),
        identifier: `Day ${i + 1}`,
      });
    }
    setLocalDays(daysArr);
  }, [selectedFrameId, frames]);

  // Fetch occupied timeslots for teacher
  useEffect(() => {
    if (!isEditMode || !selectedFrameId) {
      setOccupiedTimeslots([]);
      return;
    }
    const fetchOccupiedTimeslots = async () => {
      const occupied = await getOccupiedTimeslotsByTeacher(entity?.ID, selectedFrameId);
      setOccupiedTimeslots(occupied || []);
    };
    fetchOccupiedTimeslots();
  }, [isEditMode, selectedFrameId, entity?.ID]);

  // Prepare frame options for select
  const frameOptions = useMemo(
    () =>
      Object.values(frames?.data || {}).map((frame: any) => ({
        value: frame.ID.toString(),
        label: `${frame.NAME} (${frame.NUMBER_OF_DAYS} days)`,
      })),
    [frames]
  );

  // Helper for TimeslotsList: map occupiedTimeslots to TimeslotInput for display
  const timeslotObjects = useMemo(() => {
    return occupiedTimeslots.map((occ) => ({
      timeslot: {
        ID: occ.ID,
        NAME: occ.TIMESLOT_NAME ?? "",
        DESCRIPTION: "",
        PERIOD_START: occ.PERIOD_START,
        PERIOD_END: occ.PERIOD_END,
        SLOT_ORDER: occ.SLOT_ORDER,
        FRAME_ID: occ.FRAME_ID,
      },
      lesson: { classId: occ.CLASS_ID, subjectId: occ.SUBJECT_ID },
    }));
  }, [occupiedTimeslots]);

  return (
    <Card shadow="md" radius="lg" p="xl" withBorder style={{ maxWidth: 600, margin: "auto" }}>
      <Group mb="md" align="center">
        <IconChalkboard size={32} color="var(--mantine-color-cambridge-6)" />
        <div>
          <Title order={2} c="taupe">{formTitle}</Title>
          <Text c="dimmed" size="sm">{formDescription}</Text>
        </div>
      </Group>
      <Divider mb="md" />
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
      {/* Frame Selector - visually separated from form */}
      <div
        style={{
          margin: "32px 0 16px 0",
          padding: "16px 0",
          borderTop: "1px solid #eee",
        }}
      >
        <Select
          label="Frame Template"
          placeholder="Select a frame template"
          data={frameOptions}
          value={selectedFrameId}
          onChange={setSelectedFrameId}
          clearable
        />
      </div>
      {localDays.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4>Teacher Timetable</h4>
          <GridContainer windowHeight={windowHeight}>
            <HourGrid />
            {/* Render a column for each local day */}
            <div
              style={{
                display: "flex",
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            >
              {localDays.map((day, idx) => (
                <div
                  key={day.id}
                  style={{
                    flex: 1,
                    borderLeft: idx === 0 ? "none" : "1px solid #eee",
                    position: "relative",
                    height: "100%",
                  }}
                >
                  <TimeslotsList
                    timeSlots={
                      isEditMode
                        ? timeslotObjects.filter(
                            (t) => t.timeslot.SLOT_ORDER == idx
                          )
                        : []
                    }
                    onClickHandler={() => {}}
                    readOnly={true}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      background: "rgba(240,240,245,0.1)",
                      textAlign: "center",
                      fontSize: 12,
                    }}
                  >
                    {day.identifier}
                  </div>
                </div>
              ))}
            </div>
          </GridContainer>
        </div>
      )}
    </Card>
  );
};

export default CreateTeacher;
