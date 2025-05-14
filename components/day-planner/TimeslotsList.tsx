import React, { FC, useState } from "react";
import TimeslotFilledCard, { TimeslotLessonInput } from "./TimeslotFilledCard";
import { useStore } from "@/store/store";
import { TimeslotInput } from "@/types/databaseTypes";
import { ActionIcon, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

interface TimeslotsListProps {
  timeSlots: Array<{
    timeslot: TimeslotInput | null;
    lesson?: TimeslotLessonInput | null;
  }>;
   onClickHandler: (timeslotId: number, lesson?: TimeslotLessonInput | null) => void;
  readOnly?: boolean;
}

// Helper function to calculate position based on time
const calculatePosition = (
  time: number,
  totalMinutes: number,
  totalHeight: number
): number => {
  // Convert time (in minutes) to a fraction of the day
  const fraction = time / totalMinutes;
  // Convert the fraction to pixels
  return fraction * totalHeight;
};

const TimeslotsList: FC<TimeslotsListProps> = ({
  timeSlots,
  onClickHandler,
  readOnly = false,
}) => {
  const {
    windowHeight,
    removeActiveTimeslot,
  } = useStore();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // Total minutes in a day (24 hours * 60 minutes)
  const TOTAL_MINUTES = 24 * 60;

  return (
    <>
      {timeSlots.map((slot) => {
        if (!slot.timeslot) return null;
        const {
          PERIOD_END: end,
          PERIOD_START: start,
          ID,
          NAME,
        } = slot.timeslot;

        // Calculate position and height based on start and end times
        const top = calculatePosition(start, TOTAL_MINUTES, windowHeight);
        const height = calculatePosition(
          end - start,
          TOTAL_MINUTES,
          windowHeight
        );

        // Use a default color (lesson color logic can be added by parent if needed)
        const backgroundColor = "rgba(255, 208, 235, .5)";

        return (
          <div
            key={ID}
            onClick={
              readOnly
                ? undefined
                : () => onClickHandler(ID, slot.lesson || null)
            }
            onMouseEnter={readOnly ? undefined : () => setHoveredId(ID)}
            onMouseLeave={readOnly ? undefined : () => setHoveredId(null)}
            style={{
              position: "absolute",
              top: `${top}px`,
              height: `${height}px`,
              left: "5%",
              width: "90%",
              background: backgroundColor,
              border: "1px solid #8cbce6",
              borderRadius: "4px",
              padding: "4px 8px",
              boxSizing: "border-box",
              zIndex: 100,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              overflow: "hidden",
              cursor: readOnly ? "default" : "pointer",
            }}
          >
            {slot.lesson ? (
              <TimeslotFilledCard lesson={slot.lesson} />
            ) : (
              <>
                <Text size="xs">{NAME}</Text>
                {!readOnly && hoveredId === ID && (
                  <ActionIcon
                    variant="light"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the onClickHandler for timeslots
                      removeActiveTimeslot(ID);
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                )}
              </>
            )}
          </div>
        );
      })}
    </>
  );
};

export default TimeslotsList;
