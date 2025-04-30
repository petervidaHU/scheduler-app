"use client";

import React from "react";
import { useStore } from "@/store/store";
import { ActionIcon, Flex, Grid } from "@mantine/core";
import { Timeslots } from "@/types/databaseTypes";
import { nanoid } from "nanoid";
import HourGrid from "./day-planner/HourGrid";
import { IconTrash } from "@tabler/icons-react";
import DayPlanner from "./day-planner/DayPlanner";
import PlannerGridHeader from "./day-planner/PlannerGridHeader";
import GridContainer from "./day-planner/GridContainer";

const gridHeaderHeight = "100px";
const SchedulePlanner = () => {
  const [openForNewSlot, setOpenForNewSlot] = React.useState(false);
  const {
    scheduleState: { days, timeslots, lessons },
    windowHeight,
    addTimeslotToSchedule,
    addTimeslotToDay,
  } = useStore();

  const handleAddTimeslots = (dayId: string, slots: Array<Timeslots>) => {
    const day = days.find((d) => d.id === dayId);
    if (!day) return;

    const timeslotsInSchedule = Object.values(timeslots).map((t) => t.ID);

    slots.forEach((slot: Timeslots) => {
      let timeslotId: string;

      if (!timeslotsInSchedule.includes(slot.ID)) {
        timeslotId = nanoid();
        addTimeslotToSchedule({ [timeslotId]: slot });
      } else {
        const id = Object.keys(timeslots).find(
          (t) => timeslots[t].ID === slot.ID
        );
        if (!id) {
          throw new Error("error happened during adding timeslots to day!");
        }
        timeslotId = id;
      }

      const timeslotsInDay = day.timeSlots.map((t) => t.timeslotId);
      if (!timeslotsInDay.includes(timeslotId)) {
        addTimeslotToDay({ dayId, timeslotId });
      }
    });
  };

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
                <ActionIcon
                  onClick={() => useStore.getState().deleteDay(day.id)}
                >
                  <IconTrash
                    style={{ width: "70%", height: "70%" }}
                    stroke={1.5}
                  />
                </ActionIcon>
                {day.identifier || day.id}
              </PlannerGridHeader>

              <GridContainer windowHeight={windowHeight}>
                <DayPlanner day={day} />
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
