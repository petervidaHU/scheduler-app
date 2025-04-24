"use client";

import React from "react";
import DayPlanner from "./DayPlanner";
import { useStore } from "@/store/store";
import { ActionIcon, Button, Flex, Grid } from "@mantine/core";
import { Timeslots } from "@/types/databaseTypes";
import { nanoid } from "nanoid";

const SchedulePlanner = () => {
  const [openForNewSlot, setOpenForNewSlot] = React.useState(false);
  const {
    scheduleState: { days, timeslots, lessons },
    windowHeight,
    basicTimeslots,
    addTimeslotToSchedule,
    addTimeslotToDay,
  } = useStore();

  const hourGrid = (id: string | null = null) => {
    return Array.from(new Array(24), (_, hour) => {
      const slotTop = (windowHeight / 24) * hour;
      return (
        <div
          key={hour}
          style={{
            position: "absolute",
            top: `${slotTop}px`,
            height: `${windowHeight / 24}px`,
            left: "5%",
            width: "90%",
            background: "rgba(85, 199, 81, 0.2)",
            padding: "2px 4px",
            boxSizing: "border-box",
          }}
        >
          {hour}:00
        </div>
      );
    });
  };
  console.log;

  const handleAddTimeslots = (dayId: string, slots: Array<Timeslots>) => {
    const day = days.find((d) => d.id === dayId);
    if (!day) return;

    const timeslotsInSchedule = Object.values(timeslots).map(
      (t) => t.TEMPLATE_ID
    );

    slots.forEach((slot: Timeslots) => {
      let timeslotId: string;

      if (!timeslotsInSchedule.includes(slot.TEMPLATE_ID)) {
        timeslotId = nanoid();
        addTimeslotToSchedule({ [timeslotId]: slot });
      } else {
        const id = Object.keys(timeslots).find(
          (t) => timeslots[t].TEMPLATE_ID === slot.TEMPLATE_ID
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
          <Flex
            wrap="wrap"
            direction="column"
            align="center"
            style={{
              height: `100px`,
              overflow: "hidden",
            }}
          >
            time
          </Flex>
          <div
            style={{
              position: "relative",
              height: `${windowHeight}px`,
              overflow: "hidden",
            }}
          >
            {hourGrid()}
          </div>
        </Grid.Col>
        {days.map((day) => (
          <React.Fragment key={day.id}>
            <Grid.Col span={2}>
              <Flex
                wrap="wrap"
                direction="column"
                align="center"
                style={{
                  height: `100px`,
                  overflow: "hidden",
                }}
              >
                <Button
                  onClick={() => handleAddTimeslots(day.id, basicTimeslots)}
                >
                  use regular plan
                </Button>
                <ActionIcon
                  onClick={() => useStore.getState().deleteDay(day.id)}
                >
                  remove day
                </ActionIcon>
                {day.identifier || day.id}
              </Flex>
              <div
                style={{
                  position: "relative",
                  height: `${windowHeight}px`,
                  overflow: "hidden",
                }}
              >
                <DayPlanner day={day} />
                {openForNewSlot && hourGrid()}
              </div>
            </Grid.Col>
          </React.Fragment>
        ))}
      </Grid>
    </div>
  );
};

export default SchedulePlanner;
