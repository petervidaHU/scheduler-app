import React, { FC, useState } from "react";
import TimeslotFilledCard from "./TimeslotFilledCard";
import { useStore } from "@/store/store";
import { TimeslotInput } from "@/types/databaseTypes";
import { ActionIcon, Badge, Card, Group, Text, Tooltip } from "@mantine/core";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { TimeslotLessonInput } from "@/types/ScheduleTypes";

interface TimeslotsListProps {
  timeSlots: Array<{
    timeslot: TimeslotInput | null;
    lesson?: TimeslotLessonInput | null;
  }>;
  onClickHandler: (
    timeslotId: number,
    lesson?: TimeslotLessonInput | null
  ) => void;
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
    tenancyBasedData: {
      subjects: { data: subjectData },
    },
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

        const lesson = slot.lesson;

        // Calculate position and height based on start and end times
        const top = calculatePosition(start, TOTAL_MINUTES, windowHeight);
        const height = calculatePosition(
          end - start,
          TOTAL_MINUTES,
          windowHeight
        );

        // Use a default color (lesson color logic can be added by parent if needed)
        const backgroundColor =
          lesson && lesson.subjectId && subjectData
            ? subjectData[lesson.subjectId].HELPER_COLOR
            : "rgba(255, 208, 235, .5)";

        return (
          <Card
            onClick={
              readOnly
                ? undefined
                : () => onClickHandler(ID, slot.lesson || null)
            }
            onMouseEnter={readOnly ? undefined : () => setHoveredId(ID)}
            onMouseLeave={readOnly ? undefined : () => setHoveredId(null)}
            key={ID}
            radius="md"
            withBorder
            style={{
              padding: 8,
              display: "flex",
              alignItems: "center",
              position: "absolute",
              top: `${top}px`,
              height: `${height}px`,
              width: "100%",
              background: backgroundColor,
              border: "1px solid #8cbce6",
              boxSizing: "border-box",
              zIndex: 100,
              justifyContent: "space-between",
              overflow: "hidden",
              cursor: readOnly ? "default" : "pointer",
            }}
          >
            <Group
              justify="space-between"
              align="center"
              style={{ width: "100%" }}
            >
              {!lesson && (
                <>
                  <Text>Free Slot</Text>
                  <Text size="xs" c="dimmed">
                    {typeof start === "number" && typeof end === "number"
                      ? `${end - start} min`
                      : null}
                  </Text>
                </>
              )}
              {slot.lesson && <TimeslotFilledCard lesson={slot.lesson} />}
              {!readOnly && !lesson && (
                <Group>
                  <Tooltip label="Add lesson">
                    <ActionIcon color="cambridge" variant="light">
                      <IconPlus size={18} />
                    </ActionIcon>
                  </Tooltip>
                  
                </Group>
              )}
            </Group>
          </Card>
        );
      })}
    </>
  );
};

export default TimeslotsList;
