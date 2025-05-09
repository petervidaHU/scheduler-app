"use client";

import React, { FC, useMemo } from "react";
import { useStore } from "@/store/store";
import { ActionIcon, Grid, Select, Stack, Text, Group, Badge } from "@mantine/core";
import { DayTemplates, Timeslots } from "@/types/databaseTypes";
import HourGrid from "./day-planner/HourGrid";
import { IconTrash } from "@tabler/icons-react";
import DayPlanner from "./day-planner/DayPlanner";
import PlannerGridHeader from "./day-planner/PlannerGridHeader";
import GridContainer from "./day-planner/GridContainer";
import { useModal } from "./modals/ModalManager";

// Special value for custom frame
const CUSTOM_FRAME = "CUSTOM";

interface props {
  dayTemplates: Array<DayTemplates>;
  timeslots: Array<Timeslots>
}

const gridHeaderHeight = "150px";
const SchedulePlanner: FC<props> = ({ dayTemplates, timeslots }) => {
  const [openForNewSlot, setOpenForNewSlot] = React.useState(false);
  const [dayToDelete, setDayToDelete] = React.useState<string | null>(null);
  const { openConfirmModal } = useModal();
  
  const {
    scheduleState: { days, frameId },
    windowHeight,
    addTimeslotToDay,
    deleteDay,
    updateSchedule,
  } = useStore();

  // Create a map of template IDs to template names for quick lookup
  const templateNameMap = useMemo(() => {
    return dayTemplates.reduce((acc, template) => {
      acc[template.ID.toString()] = template.NAME;
      return acc;
    }, {} as Record<string, string>);
  }, [dayTemplates]);

  const handleAddTimeslots = (dayId: string, templateId: string) => {
    const template = dayTemplates.find((t) => t.ID.toString() === templateId);
    const timeslotId = template?.TIMESLOTS || [];
    const day = days.find((d) => d.id === dayId);
    if (!day) return;

    // Clear existing timeslots for this day
    const existingTimeslots = day.timeSlots.filter(slot => slot.lessonId);
    day.timeSlots = [...existingTimeslots];

    // Add each timeslot from the template with the template ID
    timeslotId.forEach((slot: number) => {
      const timeslotsInDay = day.timeSlots.map((t) => t.timeslotId);
      if (!timeslotsInDay.includes(slot)) {
        addTimeslotToDay({ 
          dayId, 
          timeslotId: slot, 
          templateId: template?.ID.toString() 
        });
      }
    });
  };

  const handleDeleteDayClick = (dayId: string) => {
    // Check if day has lessons
    const day = days.find(d => d.id === dayId);
    if (day && day.timeSlots.some(slot => slot.lessonId)) {
      return; // Do nothing if the day has lessons (already disabled in UI)
    }
    
    // If a non-custom frame is selected, show confirmation modal
    if (frameId && frameId !== CUSTOM_FRAME) {
      openConfirmModal({
        title: "Confirm Day Deletion",
        children: (
          <Text size="sm">
            Deleting this day will convert your schedule to use a custom frame, 
            disconnecting it from the selected frame template. This cannot be undone.
          </Text>
        ),
        labels: { confirm: "Delete and Convert to Custom", cancel: "Cancel" },
        onConfirm: () => {
          // Change frame to custom
          updateSchedule({ frameId: CUSTOM_FRAME });
          // Delete the day
          deleteDay(dayId);
        }
      });
    } else {
      // For custom frame or no frame, delete immediately
      deleteDay(dayId);
    }
  };

  const dayTemplateOptions = dayTemplates.map((t) => ({
    label: t.NAME,
    value: t.ID.toString(),
  }));

  return (
    <div>
      <input
        type="checkbox"
        id="newSlot"
        onChange={() => setOpenForNewSlot(!openForNewSlot)}
      />
      <h3>schedule planner</h3>
      <Grid>
        <Grid.Col span={1}>
          <PlannerGridHeader height={gridHeaderHeight}>Time</PlannerGridHeader>
          <HourGrid />
        </Grid.Col>

        {days.map((day) => (
          <React.Fragment key={day.id}>
            <Grid.Col span={2}>
              <PlannerGridHeader height={gridHeaderHeight}>
                <Stack>
                <ActionIcon
                  onClick={() => handleDeleteDayClick(day.id)}
                  disabled={day.timeSlots.some(slot => slot.lessonId)}
                >
                  <IconTrash
                    style={{ width: "70%", height: "70%" }}
                    stroke={1.5}
                  />
                </ActionIcon>
                <Group>
                  {day.identifier || day.id}
                  {day.templateId && templateNameMap[day.templateId] && (
                    <Badge size="sm" color="blue">
                      {templateNameMap[day.templateId]}
                    </Badge>
                  )}
                </Group>
                <Select
                  label="choose timeslot template"
                  data={dayTemplateOptions}
                  value={day.templateId}
                  onChange={(value) => value && handleAddTimeslots(day.id, value)}
                />
                </Stack>
              </PlannerGridHeader>

              <GridContainer windowHeight={windowHeight}>
                <DayPlanner day={day} timeslots={timeslots} />
                {openForNewSlot && <HourGrid />}
              </GridContainer>
            </Grid.Col>
          </React.Fragment>
        ))}
      </Grid>
    </div>
  );
};

export default SchedulePlanner;
