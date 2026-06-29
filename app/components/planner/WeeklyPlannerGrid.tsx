"use client";

import { useRef, useState } from "react";
import { Box, Group, Paper, Text } from "@mantine/core";
import { useFetcher } from "react-router";
import type { PlannerEntry, PlannerOptions } from "../../lib/repositories/plannerRepository.server";
import { LessonCard, PX_PER_MIN, DISPLAY_START_MINUTE } from "./LessonCard";
import { AddLessonDrawer, DAY_LABELS } from "./AddLessonDrawer";

const DISPLAY_END_MINUTE = 1320; // 10:00 PM
const TOTAL_DISPLAY_MINUTES = DISPLAY_END_MINUTE - DISPLAY_START_MINUTE;
const GRID_HEIGHT = TOTAL_DISPLAY_MINUTES * PX_PER_MIN;
const SCROLL_MAX_HEIGHT = 620;

const HOURS = Array.from({ length: 24 }, (_, i) => i).filter(
  (h) => h >= DISPLAY_START_MINUTE / 60 && h <= DISPLAY_END_MINUTE / 60,
);

interface Props {
  frameId: string;
  entries: PlannerEntry[];
  options: PlannerOptions;
}

type DrawerState = {
  opened: boolean;
  dayOfWeek: number;
  startMinute: number;
};

export function WeeklyPlannerGrid({ frameId, entries, options }: Props) {
  const addFetcher = useFetcher<{ ok: boolean; errors?: Record<string, string> }>();
  const removeFetcher = useFetcher<{ ok: boolean; error?: string }>();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [drawer, setDrawer] = useState<DrawerState>({
    opened: false,
    dayOfWeek: 0,
    startMinute: 480,
  });

  const removingEntryId =
    removeFetcher.state !== "idle" && removeFetcher.formData
      ? String(removeFetcher.formData.get("entryId") ?? "")
      : null;

  const handleColumnClick = (dayOfWeek: number, e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Ignore clicks on lesson cards
    if (target.closest("[data-lesson-card]")) return;
    if (!scrollRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scrollTop = scrollRef.current.scrollTop;
    const relativeY = e.clientY - rect.top + scrollTop;
    const rawMinute = Math.round((relativeY / PX_PER_MIN) / 15) * 15 + DISPLAY_START_MINUTE;
    const startMinute = Math.max(DISPLAY_START_MINUTE, Math.min(rawMinute, DISPLAY_END_MINUTE - 45));
    setDrawer({ opened: true, dayOfWeek, startMinute });
  };

  const handleRemove = (entryId: string) => {
    const form = new FormData();
    form.set("intent", "remove-entry");
    form.set("entryId", entryId);
    removeFetcher.submit(form, { method: "post" });
  };

  const handleDrawerSubmit = (data: FormData) => {
    data.set("frameId", frameId);
    addFetcher.submit(data, { method: "post" });
  };

  const addError =
    addFetcher.data && !addFetcher.data.ok
      ? addFetcher.data.errors?.form ?? "Failed to add lesson."
      : null;

  return (
    <Box>
      {/* Day header row */}
      <Group gap={0} align="stretch" wrap="nowrap">
        <Box style={{ width: 52, flexShrink: 0 }} />
        {DAY_LABELS.map((label, dayOfWeek) => (
          <Paper
            key={dayOfWeek}
            withBorder
            radius={0}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "4px 0",
              borderBottom: "2px solid var(--mantine-color-blue-4)",
              minWidth: 80,
            }}
          >
            <Text size="xs" fw={600}>
              {label.slice(0, 3)}
            </Text>
          </Paper>
        ))}
      </Group>

      {/* Scrollable grid body */}
      <Box
        ref={scrollRef}
        style={{
          maxHeight: SCROLL_MAX_HEIGHT,
          overflowY: "auto",
          overflowX: "auto",
          position: "relative",
          border: "1px solid var(--mantine-color-gray-3)",
          borderTop: "none",
        }}
      >
        <Group gap={0} align="flex-start" wrap="nowrap" style={{ minWidth: 612 }}>
          {/* Hour axis */}
          <Box style={{ width: 52, flexShrink: 0, height: GRID_HEIGHT, position: "relative" }}>
            {HOURS.map((hour) => (
              <Text
                key={hour}
                size="xs"
                c="dimmed"
                style={{
                  position: "absolute",
                  top: (hour * 60 - DISPLAY_START_MINUTE) * PX_PER_MIN,
                  left: 2,
                  lineHeight: 1,
                  userSelect: "none",
                }}
              >
                {String(hour).padStart(2, "0")}:00
              </Text>
            ))}
          </Box>

          {/* Day columns */}
          {DAY_LABELS.map((_label, dayOfWeek) => {
            const dayEntries = entries.filter((e) => e.timeslot.dayOfWeek === dayOfWeek);
            return (
              <Box
                key={dayOfWeek}
                style={{
                  flex: 1,
                  height: GRID_HEIGHT,
                  position: "relative",
                  borderLeft: "1px solid var(--mantine-color-gray-3)",
                  cursor: "crosshair",
                  minWidth: 80,
                }}
                onClick={(e) => handleColumnClick(dayOfWeek, e)}
              >
                {/* Hour gridlines */}
                {HOURS.map((hour) => (
                  <Box
                    key={hour}
                    style={{
                      position: "absolute",
                      top: (hour * 60 - DISPLAY_START_MINUTE) * PX_PER_MIN,
                      left: 0,
                      right: 0,
                      borderTop: "1px dashed var(--mantine-color-gray-3)",
                    }}
                  />
                ))}

                {/* Lesson cards */}
                <Box data-lesson-card>
                  {dayEntries.map((entry) => (
                    <LessonCard
                      key={entry.entryId}
                      entry={entry}
                      onRemove={handleRemove}
                      isRemoving={removingEntryId === entry.entryId}
                    />
                  ))}
                </Box>
              </Box>
            );
          })}
        </Group>
      </Box>

      {/* Add-lesson drawer */}
      <AddLessonDrawer
        opened={drawer.opened}
        onClose={() => setDrawer((d) => ({ ...d, opened: false }))}
        onSubmit={handleDrawerSubmit}
        frameId={frameId}
        initialDayOfWeek={drawer.dayOfWeek}
        initialStartMinute={drawer.startMinute}
        options={options}
        actionError={addError}
      />
    </Box>
  );
}
