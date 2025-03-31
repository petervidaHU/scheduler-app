"use client";

import React from "react";
import DayPlanner from "./DayPlanner";
import { useStore } from "@/store/store";
import { ActionIcon, Flex, Grid, Group, Table } from "@mantine/core";
import { Timeslots } from "@/types/databaseTypes";
interface props {
  basicTimeslots: Timeslots[];
}

const SchedulePlanner: React.FC<props> = ({ basicTimeslots }) => {
  const { days, windowHeight } = useStore();

  const hourGrid = (id: string | null = null) => {
    return Array.from(new Array(24), (_, hour) => {
      const slotTop = (windowHeight / 24) * hour;
      return (
        <>
          <div
            // onClick={() => console.log("hour", hour, id)}
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
        </>
      );
    });
  };

  return (
    <div>
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
          <>
            <Grid.Col key={day.id} span={2}>
              <Flex
                wrap="wrap"
                direction="column"
                align="center"
                style={{
                  height: `100px`,
                  overflow: "hidden",
                }}
              >
                <ActionIcon>use regular plan</ActionIcon>
                <ActionIcon onClick={() => useStore.getState().deleteDay(day.id)}>remove day</ActionIcon>
                {day.identifier || day.id}
              </Flex>
              <div
                style={{
                  position: "relative",
                  height: `${windowHeight}px`,
                  overflow: "hidden",
                }}
              >
                <DayPlanner day={day} slotTemplates={basicTimeslots} />
                {hourGrid(day.id)}
              </div>
            </Grid.Col>
          </>
        ))}
      </Grid>
    </div>
  );
};

export default SchedulePlanner;
