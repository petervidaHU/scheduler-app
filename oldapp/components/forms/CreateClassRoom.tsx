"use client";

import React, {
  useTransition,
  useActionState,
  FC,
  useState,
  useMemo,
  useEffect,
} from "react";
import {
  Container,
  TextInput,
  Button,
  Group,
  Stack,
  Select,
  NumberInput,
  Card,
  Title,
  Text,
  Divider,
  SimpleGrid,
} from "@mantine/core";
import { IconHome } from "@tabler/icons-react";
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
import { DayPlan, Schedule, OccupiedTimeslot } from "@/types/ScheduleTypes";
import { nanoid } from "nanoid";
import { getOccupiedTimeslotsByFrame } from "@/app/[locale]/(tenancy)/_actions/getOccupiedTimeslots";

// Interface for occupiedTimeslots state

const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

interface ClassRoomInput extends ManageFormServerProps {
  entity?: ClassRoom;
  error?: string;
  formTitle?: string;
  formDescription?: string;
}

export const CreateClassRoom: FC<ClassRoomInput> = ({
  entity,
  error,
  backBtnUrl,
  backBtnText,
  submitBtnText,
  toastMessage,
  formTitle = "Create New Classroom",
  formDescription = "Fill in the details to add a new classroom to your organization.",
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
  const [occupiedTimeslots, setOccupiedTimeslots] = useState<
    OccupiedTimeslot[]
  >([]);
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
    const daysArr: any[] = [];
    for (let i = 0; i < numberOfDays; i++) {
      daysArr.push({
        id: nanoid(),
        identifier: `Day ${i + 1}`,
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
      const occupiedTimeslots = await getOccupiedTimeslotsByFrame(
        entity?.ID,
        selectedFrameId
      );
      setOccupiedTimeslots(occupiedTimeslots || []);
    };
    fetchOccupiedTimeslots();
  }, [isEditMode, selectedFrameId, entity?.ID]);

  // Prepare frame options for select
  const frameOptions = useMemo(
    () =>
      Object.values(frames?.data || {}).map((frame: Frame) => ({
        value: frame.ID.toString(),
        label: `${frame.NAME} (${frame.NUMBER_OF_DAYS} days)`,
      })),
    [frames]
  );

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
      specialityId: (value: number | null) =>
        !value ? "must select speciality" : null,
    },
  });

  // Define a success handler callback
  const handleSuccess = React.useCallback(() => {
    console.log("Classroom created successfully");
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
      console.log("Submitting form with values:", submissionValues);
      crAction(submissionValues);
    });
  };

  // Helper for TimeslotsList: map OccupiedTimeslot to TimeslotInput for display
  const timeslotObjects = useMemo(() => {
    return occupiedTimeslots.map((occ) => ({
      timeslot: {
        ID: occ.ID,
        NAME: occ.TIMESLOT_NAME ?? "",
        DESCRIPTION: "", // or map from occ if available
        PERIOD_START: occ.PERIOD_START,
        PERIOD_END: occ.PERIOD_END,
        SLOT_ORDER: occ.SLOT_ORDER,
        FRAME_ID: occ.FRAME_ID,
        // Add other TimeslotInput fields as needed
      },
      lesson: { classId: occ.CLASS_ID, subjectId: occ.SUBJECT_ID },
    }));
  }, [occupiedTimeslots]);

  if (error)
    return (
      <Container size="md" my="xl">
        <p>{error}</p>
      </Container>
    );
  console.log("occupied timeslots:", occupiedTimeslots);
  console.log("frame options:", frameOptions);
  console.log("local days:", localDays);
  return (
    <Card shadow="md" radius="lg" p="xl" withBorder style={{ maxWidth: 1000, width: "90vw", margin: "32px auto" }}>
      <Group mb="md" align="center">
        <IconHome size={32} color="var(--mantine-color-cambridge-6)" />
        <div>
          <Title order={2} c="taupe">{formTitle}</Title>
          <Text c="dimmed" size="sm">{formDescription}</Text>
        </div>
      </Group>
      <Divider mb="md" />
      <form onSubmit={classRoomForm.onSubmit(handleClassRoomSubmit)}>
        <SimpleGrid cols={2} spacing="md" visibleFrom="lg">
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
        </SimpleGrid>
        {/* Custom timetable/grid sections remain outside the grid */}
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
        {/* ...rest of the component (frame selector, timetable, etc.)... */}
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
          <h4>Classroom Timetable</h4>
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

export default CreateClassRoom;
