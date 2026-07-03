"use client";

import { useEffect, useRef } from "react";
import {
  Alert,
  Button,
  Drawer,
  Group,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useFetcher } from "react-router";
import { useForm } from "@mantine/form";
import { useTranslation } from "react-i18next";
import type { PlannerEntityOption } from "../../lib/repositories/plannerRepository.server";

export const DAY_KEYS = [
  "monday", "tuesday", "wednesday", "thursday",
  "friday", "saturday", "sunday",
] as const;

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => ({
  value: String(h),
  label: String(h).padStart(2, "0") + ":00",
}));

const MINUTE_OPTIONS = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(
  (m) => ({ value: m, label: m }),
);

export function minuteToHHMM(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return { hour: String(h), minute: String(m).padStart(2, "0") };
}

function hhmmToMinute(hour: string, minute: string): number {
  return Number(hour) * 60 + Number(minute);
}

interface Props {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  frameId: string;
  initialDayOfWeek: number;
  initialStartMinute: number;
  options: {
    classes: PlannerEntityOption[];
    subjects: PlannerEntityOption[];
    teachers: PlannerEntityOption[];
    classrooms: PlannerEntityOption[];
  };
  actionError?: string | null;
}

type AvailabilityData = {
  bookedTeacherIds: string[];
  bookedClassroomIds: string[];
};

export function AddLessonDrawer({
  opened,
  onClose,
  onSubmit,
  frameId,
  initialDayOfWeek,
  initialStartMinute,
  options,
  actionError,
}: Props) {
  const { t } = useTranslation();
  const availabilityFetcher = useFetcher<AvailabilityData>();
  const prevTimeKey = useRef<string>("");

  const defaultStart = minuteToHHMM(initialStartMinute);
  const defaultEnd = minuteToHHMM(Math.min(initialStartMinute + 45, 1439));

  const form = useForm({
    initialValues: {
      dayOfWeek: String(initialDayOfWeek),
      startHour: defaultStart.hour,
      startMinute: defaultStart.minute,
      endHour: defaultEnd.hour,
      endMinute: defaultEnd.minute,
      classId: "",
      subjectId: "",
      teacherId: "",
      classroomId: "",
    },
  });

  useEffect(() => {
    if (opened) {
      const s = minuteToHHMM(initialStartMinute);
      const e = minuteToHHMM(Math.min(initialStartMinute + 45, 1439));
      form.setValues({
        dayOfWeek: String(initialDayOfWeek),
        startHour: s.hour,
        startMinute: s.minute,
        endHour: e.hour,
        endMinute: e.minute,
        classId: "",
        subjectId: "",
        teacherId: "",
        classroomId: "",
      });
      prevTimeKey.current = "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, initialDayOfWeek, initialStartMinute]);

  useEffect(() => {
    if (!opened || !frameId) return;
    const startMin = hhmmToMinute(form.values.startHour, form.values.startMinute);
    const endMin = hhmmToMinute(form.values.endHour, form.values.endMinute);
    const key = `${frameId}-${form.values.dayOfWeek}-${startMin}-${endMin}`;
    if (key === prevTimeKey.current || endMin <= startMin) return;
    prevTimeKey.current = key;
    availabilityFetcher.load(
      `/api/planner-availability?frameId=${encodeURIComponent(frameId)}&dayOfWeek=${form.values.dayOfWeek}&startMinute=${startMin}&endMinute=${endMin}`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, frameId, form.values.dayOfWeek, form.values.startHour, form.values.startMinute, form.values.endHour, form.values.endMinute]);

  const booked: AvailabilityData = availabilityFetcher.data ?? {
    bookedTeacherIds: [],
    bookedClassroomIds: [],
  };

  const teacherOptions = options.teachers.map((teacher) => ({
    value: teacher.id,
    label: booked.bookedTeacherIds.includes(teacher.id)
      ? `${teacher.name} (${t("planner.bookedSuffix")})`
      : teacher.name,
    disabled: booked.bookedTeacherIds.includes(teacher.id),
  }));

  const classroomOptions = options.classrooms.map((r) => ({
    value: r.id,
    label: booked.bookedClassroomIds.includes(r.id)
      ? `${r.name} (${t("planner.bookedSuffix")})`
      : r.name,
    disabled: booked.bookedClassroomIds.includes(r.id),
  }));

  const startMin = hhmmToMinute(form.values.startHour, form.values.startMinute);
  const endMin = hhmmToMinute(form.values.endHour, form.values.endMinute);
  const timeInvalid = endMin <= startMin;

  const handleAdd = () => {
    const data = new FormData();
    data.set("intent", "add-entry");
    data.set("dayOfWeek", form.values.dayOfWeek);
    data.set("startMinute", String(startMin));
    data.set("endMinute", String(endMin));
    if (form.values.classId) data.set("classId", form.values.classId);
    if (form.values.subjectId) data.set("subjectId", form.values.subjectId);
    if (form.values.teacherId) data.set("teacherId", form.values.teacherId);
    if (form.values.classroomId) data.set("classroomId", form.values.classroomId);
    onSubmit(data);
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={<Title order={4}>{t("planner.addLesson")}</Title>}
      position="right"
      size="md"
    >
      <Stack gap="md">
        {actionError ? (
          <Alert color="poppy" variant="light">
            {actionError}
          </Alert>
        ) : null}

        <Select
          label={t("planner.day")}
          data={DAY_KEYS.map((d, i) => ({ value: String(i), label: t(`planner.days.${d}`) }))}
          {...form.getInputProps("dayOfWeek")}
        />

        <Group grow align="flex-start">
          <Stack gap={4}>
            <Text size="sm" fw={500}>{t("planner.startTime")}</Text>
            <Group gap="xs">
              <Select
                aria-label={`${t("planner.startTime")} (h)`}
                data={HOUR_OPTIONS}
                style={{ width: 90 }}
                {...form.getInputProps("startHour")}
              />
              <Text mt={6}>:</Text>
              <Select
                aria-label={`${t("planner.startTime")} (m)`}
                data={MINUTE_OPTIONS}
                style={{ width: 80 }}
                {...form.getInputProps("startMinute")}
              />
            </Group>
          </Stack>
          <Stack gap={4}>
            <Text size="sm" fw={500}>{t("planner.endTime")}</Text>
            <Group gap="xs">
              <Select
                aria-label={`${t("planner.endTime")} (h)`}
                data={HOUR_OPTIONS}
                style={{ width: 90 }}
                {...form.getInputProps("endHour")}
              />
              <Text mt={6}>:</Text>
              <Select
                aria-label={`${t("planner.endTime")} (m)`}
                data={MINUTE_OPTIONS}
                style={{ width: 80 }}
                {...form.getInputProps("endMinute")}
              />
            </Group>
          </Stack>
        </Group>

        {timeInvalid && (
          <Alert color="khaki" variant="light">
            {t("planner.timeInvalid")}
          </Alert>
        )}

        {availabilityFetcher.state === "loading" && (
          <Text size="xs" c="dimmed">{t("planner.checkingAvailability")}</Text>
        )}

        {(booked.bookedTeacherIds.length > 0 || booked.bookedClassroomIds.length > 0) && (
          <Alert color="khaki" variant="light">
            {t("planner.someBooked")}
          </Alert>
        )}

        <Select
          label={t("planner.subject")}
          data={options.subjects.map((s) => ({ value: s.id, label: s.name }))}
          clearable
          searchable
          {...form.getInputProps("subjectId")}
        />

        <Select
          label={t("planner.class")}
          data={options.classes.map((c) => ({ value: c.id, label: c.name }))}
          clearable
          searchable
          {...form.getInputProps("classId")}
        />

        <Select
          label={t("planner.teacher")}
          data={teacherOptions}
          clearable
          searchable
          {...form.getInputProps("teacherId")}
        />

        <Select
          label={t("planner.classroom")}
          data={classroomOptions}
          clearable
          searchable
          {...form.getInputProps("classroomId")}
        />

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>{t("planner.cancel")}</Button>
          <Button onClick={handleAdd} disabled={timeInvalid}>
            {t("planner.addLesson")}
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
