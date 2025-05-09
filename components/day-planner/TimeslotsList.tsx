import React, { FC, useState } from "react";
import TimeslotFilledCard from "./TimeslotFilledCard";
import { useStore } from "@/store/store";
import { TimeslotInput } from "@/types/databaseTypes";
import { ActionIcon, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

interface props {
  timeSlots: Array<{ timeslot: TimeslotInput | null; lessonId?: string }>;
  onClickHandler: (timeslotId: number, lessonId?: string) => void;
}

// Helper function to calculate position based on time
const calculatePosition = (time: number, totalMinutes: number, totalHeight: number): number => {
  // Convert time (in minutes) to a fraction of the day
  const fraction = time / totalMinutes;
  // Convert the fraction to pixels
  return fraction * totalHeight;
};

const TimeslotsList: FC<props> = ({ timeSlots, onClickHandler }) => {
  const { 
    windowHeight, 
    removeActiveTimeslot, 
    scheduleState: { lessons }, 
    tenancyBasedData: { subjects } 
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
        const height = calculatePosition(end - start, TOTAL_MINUTES, windowHeight);
        
        const backgroundColor = subjects.data?.[lessons[slot.lessonId || '']?.subject]?.HELPER_COLOR || 'rgba(255, 208, 235, .5)';

        return (
          <div
            key={ID}
            onClick={() => onClickHandler(ID, slot.lessonId)}
            onMouseEnter={() => setHoveredId(ID)}
            onMouseLeave={() => setHoveredId(null)}
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
            }}
          >
            {slot.lessonId ? (
              <TimeslotFilledCard lessonId={slot.lessonId} />
            ) : (
              <>
                <Text size="xs">{NAME}</Text>
                {hoveredId === ID && (
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
