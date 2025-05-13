"use client";

import React, { FC, useEffect, useMemo } from "react";
import { useStore } from "@/store/store";
import {
  ActionIcon,
  Grid,
  Select,
  Stack,
  Text,
  Group,
  Badge,
  Box,
  Paper,
} from "@mantine/core";
import { DayTemplates, Timeslots } from "@/types/databaseTypes";
import HourGrid from "./day-planner/HourGrid";
import { IconTrash } from "@tabler/icons-react";
import DayPlanner from "./day-planner/DayPlanner";
import GridContainer from "./day-planner/GridContainer";
import { useModal } from "./modals/ModalManager";
import { Schedule } from "@/types/ScheduleTypes";

// Special value for custom frame
const CUSTOM_FRAME = "CUSTOM";

interface props {
  dayTemplates: Array<DayTemplates>;
  timeslots: Array<Timeslots>;
  readOnly?: boolean;
  scheduleData?: Schedule;
}

const SchedulePlanner: FC<props> = ({
  dayTemplates,
  timeslots,
  scheduleData,
  readOnly = false,
}) => {
  const [openForNewSlot, setOpenForNewSlot] = React.useState(false);
  const [dayToDelete, setDayToDelete] = React.useState<string | null>(null);
  const { openConfirmModal } = useModal();

  const {
    scheduleState: { days, frameId },
    windowHeight,
    addTimeslotToDay,
    deleteDay,
    setDays,
    updateSchedule,
    updateDayTemplateId,
  } = useStore();

  // Create a map of template IDs to template names for quick lookup
  const templateNameMap = useMemo(() => {
    return dayTemplates.reduce(
      (acc, template) => {
        acc[template.ID.toString()] = template.NAME;
        return acc;
      },
      {} as Record<string, string>
    );
  }, [dayTemplates]);

  // Helper function to get timeslot IDs from a template
  const getTimeslotIdsFromTemplate = (template: DayTemplates) => {
    let timeslotIds: number[] = [];
    
    if (typeof template.TIMESLOTS === 'string') {
      let str = (template.TIMESLOTS as string).trim();
      if (!str.startsWith('[')) str = `[${str}]`;
      try {
        timeslotIds = JSON.parse(str);
      } catch (e) {
        console.error('Failed to parse template.TIMESLOTS:', template.TIMESLOTS, e);
        timeslotIds = [];
      }
    } else if (Array.isArray(template.TIMESLOTS)) {
      timeslotIds = template.TIMESLOTS;
    }
    
    return timeslotIds;
  };
  
  useEffect(() => {
    if (scheduleData && scheduleData.days && scheduleData.days.length > 0) {
      const currentScheduleId = scheduleData?.id;
      const currentStoreScheduleId = days.length > 0 ? days[0].scheduleId : null;
      
      if (days.length === 0 || (currentScheduleId && currentScheduleId !== currentStoreScheduleId)) {
        // Process all days and ensure they have all required timeslots from their templates
        const daysWithScheduleId = scheduleData.days.map(day => {
          // Start with the day's existing timeslots (if any)
          let dayTimeSlots = [...(day.timeSlots || [])];
          
          // If the day has a template, ensure ALL timeslots from the template are included
          if (day.templateId) {
            const template = dayTemplates.find(t => t.ID.toString() === day.templateId);
            
            if (template) {
              // Get all timeslot IDs from the template
              const templateTimeslotIds = getTimeslotIdsFromTemplate(template);
              
              // Create a set of existing timeslot IDs for quick lookup
              const existingTimeslotIds = new Set(dayTimeSlots.map(slot => slot.timeslotId));
              
              // Add any missing timeslots from the template
              templateTimeslotIds.forEach(timeslotId => {
                if (!existingTimeslotIds.has(timeslotId)) {
                  dayTimeSlots.push({ timeslotId });
                }
              });
            }
          }
          
          // Return the updated day with all necessary timeslots
          return {
            ...day,
            scheduleId: currentScheduleId,
            timeSlots: dayTimeSlots
          };
        });
        
        setDays(daysWithScheduleId);
      }
    }
  }, [scheduleData, setDays, dayTemplates, days]);
  
  const handleAddTimeslots = (dayId: string, templateId: string) => {
    const template = dayTemplates.find((t) => t.ID.toString() === templateId);
    if (!template) {
      console.error(`Template with ID ${templateId} not found`);
      return;
    }
    
    // Use the helper function to get timeslot IDs
    console.log('timeslot in dddding template', template);
    const timeslotIds = getTimeslotIdsFromTemplate(template);
    console.log('timeslotIds dddddddding', timeslotIds);
    
    const day = days.find((d) => d.id === dayId);
    if (!day) {
      console.error(`Day with ID ${dayId} not found`);
      return;
    }

    updateDayTemplateId(dayId, templateId);
    
    // Get all existing timeslot IDs for quick lookup to avoid duplicates
    const existingTimeslotIds = new Set(day.timeSlots.map(slot => slot.timeslotId));
    
    // For each timeslot in the template
    timeslotIds.forEach((slotId: number) => {
      // Only add if it doesn't already exist
      if (!existingTimeslotIds.has(slotId)) {
        addTimeslotToDay({
          dayId,
          timeslotId: slotId,
          templateId: template.ID.toString(),
        });
      } else {
      }
    });
  };

  const handleDeleteDayClick = (dayId: string) => {
    // Check if day has lessons
    const day = days.find((d) => d.id === dayId);
    if (day && day.timeSlots.some((slot) => slot.lessonId)) {
      return; // Do nothing if the day has lessons (already disabled in UI)
    }

    // If a non-custom frame is selected, show confirmation modal
    if (frameId && frameId !== CUSTOM_FRAME) {
      openConfirmModal({
        title: "Confirm Day Deletion",
        children: (
          <Text size="sm">
            Deleting this day will convert your schedule to use a custom frame,
            disconnecting it from the selected frame template. This cannot be
            undone.
          </Text>
        ),
        labels: { confirm: "Delete and Convert to Custom", cancel: "Cancel" },
        onConfirm: () => {
          // Change frame to custom
          updateSchedule({ frameId: CUSTOM_FRAME });
          // Delete the day
          deleteDay(dayId);
        },
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
      {!readOnly && (
        <input
          type="checkbox"
          id="newSlot"
          onChange={() => setOpenForNewSlot(!openForNewSlot)}
        />
      )}
      <h3>schedule planner</h3>

      {/* Day Headers Section */}
      <Grid mb="md">
        <Grid.Col span={1}>
          {/* Empty space for time column */}
          <Paper p="sm" withBorder>
            <Text fw={500} ta="center">
              Time
            </Text>
          </Paper>
        </Grid.Col>

        {days.map((day) => (
          <Grid.Col span={2} key={`day-header-${day.id}`}>
            <Paper p="sm" withBorder>
              <Stack>
                <Group justify="apart">
                  <Group>
                    {day.identifier || day.id}
                    {day.templateId && templateNameMap[day.templateId] && (
                      <Badge size="sm" color="blue" title="Applied template">
                        {templateNameMap[day.templateId]}
                      </Badge>
                    )}
                    {!day.templateId && (
                      <Badge size="sm" color="gray" title="No template applied">No Template</Badge>
                    )}
                  </Group>
                  {!readOnly && (
                    <ActionIcon
                      color="red"
                      onClick={() => handleDeleteDayClick(day.id)}
                      disabled={day.timeSlots.some((slot) => slot.lessonId)}
                    >
                      <IconTrash
                        style={{ width: "70%", height: "70%" }}
                        stroke={1.5}
                      />
                    </ActionIcon>
                  )}
                </Group>
                {!readOnly && (
                  <Select
                    label="Choose timeslot template"
                    data={dayTemplateOptions}
                    value={day.templateId}
                    onChange={(value) =>
                      value && handleAddTimeslots(day.id, value)
                    }
                  />
                )}
              </Stack>
            </Paper>
          </Grid.Col>
        ))}
      </Grid>

      {/* Time Grid Section */}
      <Grid>
        <Grid.Col span={1}>
          <HourGrid />
        </Grid.Col>

        {days.map((day) => (
          <Grid.Col span={2} key={`day-grid-${day.id}`}>
            <GridContainer windowHeight={windowHeight}>
              <DayPlanner day={day} timeslots={timeslots} readOnly={readOnly} />
              {openForNewSlot && !readOnly && <HourGrid />}
            </GridContainer>
          </Grid.Col>
        ))}
      </Grid>
    </div>
  );
};

export default SchedulePlanner;
