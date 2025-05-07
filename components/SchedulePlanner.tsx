"use client";

import React, { FC } from "react";
import { useStore } from "@/store/store";
import { ActionIcon, Grid, Select, Stack } from "@mantine/core";
import { DayTemplates, Timeslots } from "@/types/databaseTypes";
import HourGrid from "./day-planner/HourGrid";
import { IconTrash } from "@tabler/icons-react";
import DayPlanner from "./day-planner/DayPlanner";
import PlannerGridHeader from "./day-planner/PlannerGridHeader";
import GridContainer from "./day-planner/GridContainer";

interface props {
  dayTemplates: Array<DayTemplates>;
  timeslots: Array<Timeslots>
}

const gridHeaderHeight = "150px";
const SchedulePlanner: FC<props> = ({ dayTemplates, timeslots }) => {
  const [openForNewSlot, setOpenForNewSlot] = React.useState(false);
  const {
    scheduleState: { days },
    windowHeight,
    addTimeslotToDay,
  } = useStore();

  const handleAddTimeslots = (dayId: string, templateId: string) => {
    const template = dayTemplates.find((t) => t.ID.toString() === templateId);
    const timeslotId = template?.TIMESLOTS || [];
    const day = days.find((d) => d.id === dayId);
    if (!day) return;

    timeslotId.forEach((slot: number) => {
      const timeslotsInDay = day.timeSlots.map((t) => t.timeslotId);
      if (!timeslotsInDay.includes(slot)) {
        addTimeslotToDay({ dayId, timeslotId: slot });
      }
    });
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
                  onClick={() => useStore.getState().deleteDay(day.id)}
                >
                  <IconTrash
                    style={{ width: "70%", height: "70%" }}
                    stroke={1.5}
                  />
                </ActionIcon>
                {day.identifier || day.id}
                <Select
                  label="choose timeslot template"
                  data={dayTemplateOptions}
                  onChange={(value) => handleAddTimeslots(day.id, value!)}
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
