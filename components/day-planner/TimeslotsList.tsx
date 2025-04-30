import React, { FC } from "react";
import TimeslotFilledCard from "./TimeslotFilledCard";
import { useStore } from "@/store/store";
import { TimeslotInput } from "@/types/databaseTypes";
import { Text } from "@mantine/core";

interface props {
  timeSlots: Array<{ timeslot: TimeslotInput; lessonId?: string }>;
  onClickHandler: any,
}

const TimeslotsList: FC<props> = ({ timeSlots, onClickHandler }) => {
  const { windowHeight } = useStore();
  console.log('timeslots', timeSlots);

  return (
    <>
      {timeSlots.map((slot) => {
        const { PERIOD_END: end, PERIOD_START: start, ID, NAME } = slot.timeslot;
        const top = (start / windowHeight) * windowHeight;
        const height = ((end - start) / windowHeight) * windowHeight;

        return (
          <div
            onClick={() => onClickHandler(ID)}
            key={ID}
            style={{
              position: "absolute",
              top: `${top}px`,
              height: `${height}px`,
              left: "5%",
              width: "90%",
              background: `${slot.lessonId ? "rgba(122, 13, 136, 0.5)" : "rgba(255, 208, 235, .5)"}`,
              border: "1px solid #8cbce6",
              borderRadius: "4px",
              padding: "2px 4px",
              boxSizing: "border-box",
              zIndex: 100,
            }}
          >
            {slot.lessonId ? (
              <TimeslotFilledCard lessonId={slot.lessonId} />
            ) : (
              <Text size="xs">{NAME}</Text>
            )}
          </div>
        );
      })}
    </>
  );
};

export default TimeslotsList;
