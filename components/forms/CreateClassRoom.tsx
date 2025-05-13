"use client";

import React, { useTransition, useActionState, FC, useState, useMemo, useEffect } from "react";
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
import { FormActionType, ManageFormServerProps } from "@/types/FormActionType";
import { redirect } from "next/navigation";
import { ClassRoom, ErrorResponse, Frame } from "@/types/databaseTypes";
import { manageClassRoom } from "@/app/[locale]/(tenancy)/_actions/manageClassRoom";
import { useTenancyBasedFormResponse } from "@/lib/hooks/useFormResponse";
import { useStore } from "@/store/store";
import { Entities } from "@/types/Entities";
import GridContainer from "../day-planner/GridContainer";
import HourGrid from "../day-planner/HourGrid";
import TimeslotsList from "../day-planner/TimeslotsList";
import { getSchedulesByFrame } from "@/app/[locale]/(tenancy)/my-tenancy/schedules/_actions/getSchedulesByFrame";
import { DayPlan, Schedule } from "@/types/ScheduleTypes";
import { nanoid } from "nanoid";
import { getOccupiedTimeslotsByFrame } from "@/app/[locale]/(tenancy)/_actions/getOccupiedTimeslots";



const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

interface ClassRoomInput extends ManageFormServerProps {
  entity?: ClassRoom;
  error?: string,
}

export const CreateClassRoom: FC<ClassRoomInput> = ({
  entity,
  error,
  backBtnUrl,
  backBtnText,
  submitBtnText,
  toastMessage,
}) => {
  const {
    tenancyBasedData: { specialties, frames },
    windowHeight,
  } = useStore();
  const [isPending, startTransition] = useTransition();
  const [crState, crAction] = useActionState(manageClassRoom, {
    ...init,
  });
  // Frame selection state
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const [occupiedTimeslots, setOccupiedTimeslots] = useState<any[]>([]);
  const isEditMode = !!entity?.ID;

  // Local days state for timetable grid
  const [localDays, setLocalDays] = useState<DayPlan[]>([]);

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
    const daysArr: DayPlan[] = [];
    for (let i = 0; i < numberOfDays; i++) {
      daysArr.push({
        id: nanoid(),
        order: String(i + 1),
        identifier: `Day ${i + 1}`,
        timeSlots: [],
        lessons: [],
      });
    }
    setLocalDays(daysArr);
  }, [selectedFrameId, frames]);

  useEffect(() => {
    if (!isEditMode || !selectedFrameId) {
      setOccupiedTimeslots([]);
      return;
    }
    const fetchOccupiedTimeslots = async () => {
      const occupiedTimeslots = await getOccupiedTimeslotsByFrame(entity?.ID, selectedFrameId);
      setOccupiedTimeslots(occupiedTimeslots || []);
    };
    fetchOccupiedTimeslots();
  }, [isEditMode, selectedFrameId, entity?.ID]);

  // Prepare frame options for select
  const frameOptions = useMemo(() =>
    Object.values(frames?.data || {}).map((frame: Frame) => ({
      value: frame.ID.toString(),
      label: `${frame.NAME} (${frame.NUMBER_OF_DAYS} days)`
    })), [frames]);

  const classRoomForm = useForm({
    initialValues: {
      name: entity?.NAME || "",
      specialityId: entity?.SPECIALITY_ID || null,
      description: entity?.DESCRIPTION || "",
      capacity: entity?.CAPACITY || 0,
      id: entity?.ID || null,
    },
    validate: {
      capacity: (value: number) =>
        value <= 0 ? "Classroom capacity must be larger than 0" : null,
      specialityId: (value: number | null) => (!value ? "must select speciality" : null),
    },
  });

  // Define a success handler callback
  const handleSuccess = React.useCallback(() => {
    console.log('Classroom created successfully');
    // Any additional cleanup can be done here
  }, []);

  useTenancyBasedFormResponse(
    crState,
    entity?.ID ? null : classRoomForm,
    toastMessage,
    Entities.classroom,
    handleSuccess
  );

  const handleClassRoomSubmit = (values: typeof classRoomForm.values) => {
    console.log("Submitting classroom values:", values);
    
    // Create a copy to avoid direct mutation
    const submissionValues = { ...values };
    
    // Use transition to avoid re-renders during form submission
    startTransition(() => {
      console.log('Submitting form with values:', submissionValues);
      crAction(submissionValues);
    });
  };

  // Helper for TimeslotsList: get timeslot objects for display (mocked for now)
  const timeslotObjects = useMemo(() => {
    // Add dayId to each object for filtering by day
    return occupiedTimeslots.map((occ) => ({
      timeslot: { ID: occ.timeslotId, NAME: `Slot ${occ.timeslotId}`, PERIOD_START: 0, PERIOD_END: 60, DESCRIPTION: "" },
      lessonId: occ.lessonId,
      dayId: occ.dayId,
    }));
  }, [occupiedTimeslots]);

  if (error) return (
    <Container size="md" my="xl">
      <p>{error}</p>
    </Container>
  );
console.log('occupied timeslots:', occupiedTimeslots);
  console.log('frame options:', frameOptions);
  return (
    <Container size="md" my="xl">
      {specialties.error && <p>{specialties.error}</p>}
      {specialties.isLoading && <p>Loading specialities</p>}
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
            data={Object.values(specialties?.data || {})}
            {...classRoomForm.getInputProps("specialityId")}
            value={classRoomForm.values.specialityId?.toString()}
          />
          <Group mt="md">
            <Button disabled={isPending} type="submit">
              {submitBtnText || "Create Classroom"}
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
      {/* Frame Selector - visually separated from form */}
      <div style={{ margin: '32px 0 16px 0', padding: '16px 0', borderTop: '1px solid #eee' }}>
        <Select
          label="Frame Template"
          placeholder="Select a frame template"
          data={frameOptions}
          value={selectedFrameId}
          onChange={setSelectedFrameId}
          clearable
        />
      </div>
      {/* Timetable UI */}
      <div style={{ marginTop: 16 }}>
        <h4>Classroom Timetable</h4>
        <GridContainer windowHeight={windowHeight}>
          <HourGrid />
          {/* Render a column for each local day */}
          <div style={{ display: 'flex', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            {localDays.map((day, idx) => (
              <div key={day.id} style={{ flex: 1, borderLeft: idx === 0 ? 'none' : '1px solid #eee', position: 'relative', height: '100%' }}>
                {/* TimeslotsList for this day: filter occupiedTimeslots for this day.id */}
                <TimeslotsList
                  timeSlots={isEditMode ? timeslotObjects.filter(t => t.dayId === day.id) : []}
                  onClickHandler={() => {}}
                  readOnly={true}
                />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', background: 'rgba(240,240,245,0.1)', textAlign: 'center', fontSize: 12 }}>{day.identifier}</div>
              </div>
            ))}
          </div>
        </GridContainer>
      </div>
    </Container>
  );
};

export default CreateClassRoom;
