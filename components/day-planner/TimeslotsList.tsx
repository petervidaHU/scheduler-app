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
    isCustom?: boolean;
  }>;
  onClickHandler: (
    timeslotId: number,
    lesson?: TimeslotLessonInput | null
  ) => void;
  readOnly?: boolean;
  readOnlyCustomTimeslots?: boolean;
  /**
   * The minute of the day the grid starts from (e.g. 0 for midnight, 480 for 8:00 AM)
   */
  gridStartMinute?: number;
  /**
   * The minute of the day the grid ends (exclusive). Optional, for filtering.
   */
  gridEndMinute?: number;
}

const TimeslotsList: FC<TimeslotsListProps> = ({
  timeSlots,
  onClickHandler,
  readOnly = false,
  readOnlyCustomTimeslots = false,
  gridStartMinute = 0,
  gridEndMinute,
}) => {
  const {
    removeActiveTimeslot,
    removeCustomTimeslotById,
    tenancyBasedData: {
      subjects: { data: subjectData },
    },
  } = useStore();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div style={{ display: "contents" }}>
      {timeSlots.map((slot) => {
        if (!slot.timeslot) return null;
        const { PERIOD_END: end, PERIOD_START: start, ID, NAME } = slot.timeslot;
        if ((typeof gridEndMinute === 'number' && start >= gridEndMinute) || end <= gridStartMinute) {
          return null;
        }
        const lesson = slot.lesson;
        const isCustom = slot.isCustom;
        const gridRowStart = Math.floor((start - gridStartMinute) / 5) + 1;
        const gridRowEnd = Math.floor((end - gridStartMinute) / 5) + 1;
        const backgroundColor =
          lesson && lesson.subjectId && subjectData
            ? subjectData[lesson.subjectId].HELPER_COLOR
            : isCustom
            ? "rgba(255, 255, 200, .7)"
            : "rgba(255, 208, 235, .5)";
        return (
          <Card
            onClick={readOnly ? undefined : () => onClickHandler(ID, slot.lesson || null)}
            onMouseEnter={readOnly ? undefined : () => setHoveredId(ID)}
            onMouseLeave={readOnly ? undefined : () => setHoveredId(null)}
            key={ID}
            radius="md"
            withBorder
            style={{
              padding: 8,
              display: "flex",
              alignItems: "center",
              gridRow: `${gridRowStart} / ${gridRowEnd}`,
              gridColumn: "1 / 3", // Cover both hour label and timeslot columns
              minHeight: '20px',
              width: "100%",
              background: backgroundColor,
              border: isCustom ? "2px dashed #e6b800" : "1px solid #8cbce6",
              boxSizing: "border-box",
              zIndex: 3,
              justifyContent: "space-between",
              overflow: "hidden",
              cursor: readOnly ? "default" : "pointer",
              position: "relative",
            }}
          >
            {/* Absolutely positioned delete icon for custom timeslots */}
            {!readOnly && !readOnlyCustomTimeslots && !lesson && isCustom && hoveredId === ID && (
              <Tooltip label="Delete timeslot" withArrow>
                <ActionIcon
                  color="cambridge"
                  variant="light"
                  onClick={e => {
                    e.stopPropagation();
                    removeCustomTimeslotById(ID);
                  }}
                  style={{ position: "absolute", top: 4, right: 4, zIndex: 10 }}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Tooltip>
            )}
            <Group justify="space-between" align="center" style={{ width: "100%" }}>
              {!lesson && (
                <>
                  <Text>{NAME || isCustom ? "Custom Timeslot" : "Free Slot"}</Text>
                  <Text size="xs" c="dimmed">
                    {typeof start === "number" && typeof end === "number" ? `${end - start} min` : null}
                  </Text>
                </>
              )}
              {slot.lesson && <TimeslotFilledCard lesson={slot.lesson} />}
            </Group>
          </Card>
        );
      })}
    </div>
  );
};

export default TimeslotsList;
