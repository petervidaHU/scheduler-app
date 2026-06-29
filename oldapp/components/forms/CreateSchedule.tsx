"use client";

import { useForm } from "@mantine/form";
import {
  Select,
  Textarea,
  Button,
  TextInput,
  LoadingOverlay,
  Title,
  Card,
  Divider,
  Group,
  Text,
  SimpleGrid,
  Switch,
} from "@mantine/core";
import {
  createSchedule,
  ScheduleContext,
} from "@/app/[locale]/(tenancy)/my-tenancy/schedules/_actions/createSchedule";
import { updateSchedule } from "@/app/[locale]/(tenancy)/my-tenancy/schedules/_actions/updateSchedule";
import { getScheduleById } from "@/app/[locale]/(tenancy)/my-tenancy/schedules/_actions/getScheduleById";
import { FormActionType } from "@/types/FormActionType";
import { useActionState, useTransition } from "react";
import { useStore } from "@/store/store";
import { nanoid } from "nanoid";
import { getSyllabusAction } from "@/app/[locale]/(tenancy)/my-tenancy/schedules/_actions/getSyllabusAction";
import { DataWithOptionWithError, FormFields } from "@/types/ScheduleTypes";
import { DayPlan, Schedule } from "@/types/ScheduleTypes";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Syllabus } from "@/types/databaseTypes";
import { useTenancyBasedFormResponse } from "@/lib/hooks/useFormResponse";
import { Entities } from "@/types/Entities";
import React from "react";

// Special value for custom frame
const CUSTOM_FRAME = "CUSTOM";

const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

interface SchedulePageProps {
  scheduleId?: string;
  scheduleData?: Schedule;
  syllabusData?: DataWithOptionWithError<Syllabus> | null;
  submitBtnText: string;
  backBtnText: string;
  [key: string]: any;
}

const SchedulePage: React.FC<SchedulePageProps> = ({
  scheduleId,
  scheduleData,
  syllabusData,
  submitBtnText,
  backBtnText,
  ...props
}: SchedulePageProps) => {
  const router = useRouter();
  const { data: syllabusDataFromserver, error: syllabusError } =
    syllabusData || { data: null, error: null };
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!scheduleId;
  const [isStoreInitialized, setIsStoreInitialized] = useState(false);

  const {
    tenancyBasedData: {
      teachers: { data: teachers },
      classes: { data: classes },
      classRooms: { data: classRooms },
      subjects: { data: subjects },
      frames: { data: frames },
    },
    addDay,
    deleteDay,
    updateSyllabus,
    updateSchedule: updateScheduleInStore,
    scheduleState: { days, lessons },
    resetScheduleState,
    setDays,
  } = useStore();

  // Initialize form with default values or scheduleData if available
  const form = useForm({
    initialValues: {
      [FormFields.name]: scheduleData?.name || "",
      [FormFields.class]: scheduleData?.class?.toString() || "",
      [FormFields.description]: scheduleData?.description || "",
      [FormFields.owner]: scheduleData?.owner?.toString() || "",
      [FormFields.status]: scheduleData?.status || "DRAFT",
      frameId: scheduleData?.frameId?.toString() || "",
      variations: "",
      usingCustomTimeslots: scheduleData?.usingCustomTimeslots ?? true,
    },
    validate: {
      class: (value) => (!value ? "Class is required" : null),
      frameId: (value) => (!value ? "Frame is required" : null),
    },
    onValuesChange: async (values, previous) => {
      // Only update if store is already initialized
      if (!isEditMode || (isEditMode && isStoreInitialized)) {
        updateScheduleState(values, previous);
      }

      // If class changed and name is empty, populate it
      if (values.class !== previous.class && values.class) {
        const selectedClass = classes?.[values.class];
        if (selectedClass && !values.name) {
          form.setFieldValue(
            FormFields.name,
            `Weekly schedule for ${selectedClass.NAME}`
          );
        }
      }

      if (values.class !== previous.class && values.class !== "") {
        // Use server-loaded syllabus if available, otherwise fetch it
        if (
          values.class === scheduleData?.class?.toString() &&
          syllabusDataFromserver &&
          syllabusError === null
        ) {
          updateSyllabus(syllabusDataFromserver);
        } else {
          const { data: newSyllabus, error: newSyllabusError } =
            await getSyllabusAction(Number(values.class));
          if (!newSyllabus || syllabusError) {
            console.error("Error fetching syllabus:", newSyllabusError);
            return;
          }
          updateSyllabus(newSyllabus);
        }
      }

      // Update frameId in store
      if (values.frameId !== previous.frameId) {
        updateScheduleInStore({ frameId: values.frameId });

        // Handle frame change - update days based on the frame's NUMBER_OF_DAYS
        if (values.frameId && values.frameId !== CUSTOM_FRAME) {
          const selectedFrame = frames?.[values.frameId];
          if (selectedFrame) {
            updateDaysBasedOnFrame(selectedFrame.NUMBER_OF_DAYS);
          }
        } else if (values.frameId === CUSTOM_FRAME) {
          // For custom frame, clear existing days but don't auto-create new ones
          days.forEach((day) => {
            deleteDay(day.id);
          });
        }
      }
    },
  });

  /**
   * Synchronously initializes the store with schedule data
   */
  const initializeStore = useCallback(() => {
    if (!scheduleData) return;

    resetScheduleState();
    updateScheduleInStore({
      id: scheduleData.id,
      name: scheduleData.name,
      class: scheduleData.class,
      description: scheduleData.description,
      owner: scheduleData.owner,
      status: scheduleData.status,
      frameId: scheduleData.frameId,
      usingCustomTimeslots: scheduleData.usingCustomTimeslots || false,
    });

    if (syllabusDataFromserver && syllabusError === null) {
      // Use server-loaded syllabus if available
      updateSyllabus(syllabusDataFromserver);
    }

    // Initialize days and lessons directly into store state
    if (scheduleData.days && scheduleData.days.length > 0) {
      setDays(scheduleData.days);
    }
    if (scheduleData.lessons && Object.keys(scheduleData.lessons).length > 0) {
      // Merge lessons into store instead of overwriting
      const currentState = useStore.getState();
      useStore.setState({
        ...currentState,
        scheduleState: {
          ...currentState.scheduleState,
          lessons: { ...currentState.scheduleState.lessons, ...scheduleData.lessons },
        },
      });
      // Debug: log lessons after initialization
      console.debug('[Schedule] Lessons after store initialization:', {
        ...currentState.scheduleState.lessons,
        ...scheduleData.lessons,
      });
    }
    setIsStoreInitialized(true);
  }, [
    scheduleData,
    syllabusDataFromserver,
    syllabusError,
    resetScheduleState,
    updateScheduleInStore,
    updateSyllabus,
    setDays,
  ]);

  // Initialize store on mount
  useEffect(() => {
    if (!isStoreInitialized) {
      initializeStore();
    }
  }, [initializeStore, isStoreInitialized]);

  const [isPending, startTransition] = useTransition();
  const [createState, createAction] = useActionState(createSchedule, init);
  const [updateState, updateAction] = useActionState(updateSchedule, init);

  // Define a success handler callback using useCallback to prevent unnecessary re-renders
  const handleSuccess = React.useCallback(() => {
    // Navigation will trigger component unmount which will reset the state
    router.push("/en/my-tenancy/schedules");
  }, [router]);

  // Call the hook directly. Its useEffect will handle the logic.
  useTenancyBasedFormResponse(
    isEditMode ? updateState : createState,
    isEditMode ? null : form, // Pass form only for create mode to reset it
    isEditMode
      ? "Schedule updated successfully"
      : "Schedule created successfully",
    Entities.class, // Still using Entities.class as placeholder for now
    handleSuccess
  );

  // Fallback data loading if server data isn't available
  useEffect(() => {
    if (scheduleId && !scheduleData && !isStoreInitialized) {
      const loadSchedule = async () => {
        setIsLoading(true);
        try {
          const fetchedScheduleData = await getScheduleById(scheduleId);

          if (fetchedScheduleData) {
            // Update form values with schedule data
            form.setValues({
              name: fetchedScheduleData.name || "",
              class: fetchedScheduleData.class?.toString() || "",
              description: fetchedScheduleData.description || "",
              owner: fetchedScheduleData.owner?.toString() || "",
              status: fetchedScheduleData.status || "DRAFT",
              frameId: fetchedScheduleData.frameId?.toString() || "",
              variations: "",
              usingCustomTimeslots:
                fetchedScheduleData.usingCustomTimeslots ?? true,
            });

            // Fetch syllabus if needed
            let syllabus = null;
            if (fetchedScheduleData.class) {
              syllabus = await getSyllabusAction(fetchedScheduleData.class);
            }

            // Store the fetched data in temporary variables
            const tempScheduleData = fetchedScheduleData;
            const tempSyllabusData = syllabus;

            // Reset and initialize the store with the fetched data
            resetScheduleState();

            // Update schedule state
            updateScheduleInStore({
              id: tempScheduleData.id,
              name: tempScheduleData.name,
              class: tempScheduleData.class,
              description: tempScheduleData.description,
              owner: tempScheduleData.owner,
              status: tempScheduleData.status,
              frameId: tempScheduleData.frameId,
              usingCustomTimeslots: tempScheduleData.usingCustomTimeslots,
            });

            // Update syllabus if available
            if (tempSyllabusData) {
              updateSyllabus(tempSyllabusData);
            }

            // Add scheduleId reference to each day for tracking purposes
            const daysWithScheduleId = tempScheduleData.days.map((day) => ({
              ...day,
              scheduleId: tempScheduleData.id,
            }));

            // Add all days at once
            setDays(daysWithScheduleId);

            // Set lessons directly into store
            if (
              tempScheduleData.lessons &&
              Object.keys(tempScheduleData.lessons).length > 0
            ) {
              const currentState = useStore.getState();
              useStore.setState({
                ...currentState,
                scheduleState: {
                  ...currentState.scheduleState,
                  lessons: { ...tempScheduleData.lessons },
                },
              });
            }

            // Mark as initialized
            setIsStoreInitialized(true);
          }
        } catch (error) {
          console.error("Error loading schedule:", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadSchedule();
    }
  }, [
    scheduleId,
    scheduleData,
    isStoreInitialized,
    form,
    resetScheduleState,
    updateScheduleInStore,
    updateSyllabus,
    setDays,
  ]);

  /**
   * Efficiently updates schedule state when form values change
   */
  const updateScheduleState = (
    values: Record<string, any>,
    previous: Record<string, any>
  ) => {
    // Collect all changes to make a single store update
    const changes: Record<string, any> = {};

     Object.keys(form.values).forEach((element) => {
      if (values[element] !== previous[element]) {
        changes[element] = values[element];
      }
    });

    // Only update store if there are changes
    if (Object.keys(changes).length > 0) {
      updateScheduleInStore(changes);
    }
  };

  const classOptions = Object.entries(classes || {}).map(([id, classObj]) => ({
    value: id,
    label: `${classObj.NAME} / (${classObj.NUMBER_OF_STUDENTS} students)`,
  }));

  // Add Custom Frame option to the frame options
  const frameOptions = [
    { value: CUSTOM_FRAME, label: "Custom Frame (Manual day creation)" },
    ...Object.entries(frames || {}).map(([id, frameObj]) => ({
      value: id,
      label: `${frameObj.NAME} (${frameObj.RECURRENCE === 1 ? "Recurring" : "Non-recurring"}, ${frameObj.NUMBER_OF_DAYS} days)`,
    })),
  ];

  /**
   * Updates days based on a frame's NUMBER_OF_DAYS property
   * Creates a fresh set of days instead of modifying existing ones
   */
  const updateDaysBasedOnFrame = useCallback(
    (numberOfDays: number) => {
      // Create all days in a single array
      const newDays: DayPlan[] = [];

      for (let i = 0; i < numberOfDays; i++) {
        newDays.push({
          id: nanoid(),
          order: String(i + 1),
          identifier: `Day ${i + 1}`,
          timeSlots: [],
          lessons: [],
          templateId: undefined,
        });
      }

      // Update all days at once for better performance and consistency
      setDays(newDays);
    },
    [setDays]
  );

  // Update days if frameId is already set when component mounts
  useEffect(() => {
    // Only update days based on frame after store is initialized
    if (isStoreInitialized) {
      const frameId = form.values.frameId;
      if (frameId && frameId !== CUSTOM_FRAME && frames?.[frameId]) {
        updateDaysBasedOnFrame(frames[frameId].NUMBER_OF_DAYS);
      }
    }
  }, [frames, form.values.frameId, updateDaysBasedOnFrame, isStoreInitialized]);

  /**
   * Handles form submission with proper state capture
   */
  const handleScheduleFormSubmit = useCallback(
    (values: typeof form.values) => {
      // Create a snapshot of the current state to prevent stale data
      const currentState = useStore.getState().scheduleState;
      const currentLessons = { ...currentState.lessons };
      console.log(' const currentLessons = { ...currentState.lessons }', currentLessons);
      const currentDays = [...currentState.days];
      const customTimeslots = currentState.customTimeslots || [];
      const usingCustomTimeslots = values.usingCustomTimeslots;

      startTransition(() => {
        // Build the context for submission
        const context: ScheduleContext = {
          name: values.name,
          description: values.description,
          frameId:
            values.frameId === CUSTOM_FRAME
              ? CUSTOM_FRAME
              : Number(values.frameId),
          class: Number(values.class),
          lessons: currentLessons,
          days: currentDays.map((day) => ({
            id: day.id,
            timeSlots: day.timeSlots.map((slot) => ({
              timeslotId: slot.timeslotId,
              lessonId: slot.lessonId,
            })),
            templateId: day.templateId,
          })),
          owner: values.owner,
          usingCustomTimeslots,
          customTimeslots,
        };

        if (isEditMode && scheduleId) {
          updateAction({ ...context, id: scheduleId });
        } else {
          createAction(context);
        }
      });
    },
    [updateAction, createAction, isEditMode, scheduleId]
  );

  // Add cleanup on component unmount to prevent stale state
  useEffect(() => {
    // This cleanup function runs when the component is unmounted
    return () => {
      // Reset the schedule state when navigating away from the component
      resetScheduleState();
      setIsStoreInitialized(false);
    };
  }, [resetScheduleState]);

  /**
   * Helper function to update lessons in the store
   * This will only be used for individual lesson updates, not for initialization
   */
  const updateLessonsInStore = useCallback((lessons: Record<string, any>) => {
    if (!lessons || Object.keys(lessons).length === 0) {
      return;
    }

    // Update lessons directly in the store
    const currentState = useStore.getState();
    useStore.setState({
      ...currentState,
      scheduleState: {
        ...currentState.scheduleState,
        lessons: { ...currentState.scheduleState.lessons, ...lessons },
      },
    });
  }, []);

  /**
   * Effect to validate schedule state integrity
   * This serves as a safety check to ensure lessons remain consistent
   */
  useEffect(() => {
    // Only run this check if we're in edit mode and store is initialized
    if (
      !isEditMode ||
      !isStoreInitialized ||
      !scheduleData ||
      !scheduleData.lessons
    )
      return;

    const expectedLessonCount = Object.keys(scheduleData.lessons).length;
    if (expectedLessonCount === 0) return;

    const actualLessonCount = Object.keys(lessons).length;

    // If lessons count doesn't match what we expect from scheduleData
    if (actualLessonCount !== expectedLessonCount) {
      // Get list of lesson IDs from both sources
      const expectedLessonIds = new Set(Object.keys(scheduleData.lessons));
      const actualLessonIds = new Set(Object.keys(lessons));

      // Find missing lessons
      const missingLessons: Record<string, any> = {};
      expectedLessonIds.forEach((id) => {
        if (!actualLessonIds.has(id)) {
          missingLessons[id] = scheduleData.lessons[id];
        }
      });

      // Only update if we found missing lessons
      if (Object.keys(missingLessons).length > 0) {
        updateLessonsInStore(missingLessons);
      }
    }
  }, [
    isEditMode,
    isStoreInitialized,
    scheduleData,
    lessons,
    updateLessonsInStore,
  ]);

  return (
    <Card
      shadow="md"
      radius="lg"
      p="xl"
      withBorder
      style={{ maxWidth: 1000, width: "90vw", margin: "32px auto" }}
    >
      <LoadingOverlay visible={isLoading} />
      <Group mb="md" align="center" justify="space-between">
        <div>
          <Title order={2} c="taupe">
            {props.formTitle || "Schedule Details"}
          </Title>
          <Text c="dimmed" size="sm">
            {props.formDescription ||
              "Fill in the details to create or edit a schedule."}
          </Text>
        </div>
        <Button
          type="button"
          variant="outline"
          color="gray"
          size="sm"
          onClick={() => {
            if (props.backBtnUrl) {
              window.location.href = props.backBtnUrl;
            } else {
              window.location.href = "/my-tenancy/admin";
            }
          }}
        >
          {backBtnText}
        </Button>
      </Group>
      <Divider mb="md" />
      <form onSubmit={form.onSubmit(handleScheduleFormSubmit)}>
        <SimpleGrid cols={2} spacing="md">
          <TextInput
            label="Schedule Name"
            placeholder="Enter a descriptive name for this schedule"
            withAsterisk
            mb="md"
            {...form.getInputProps(FormFields.name)}
          />
          <Select
            label="Class"
            placeholder="Select a class for this schedule"
            data={classOptions}
            withAsterisk
            mb="md"
            {...form.getInputProps(FormFields.class)}
          />
          <Select
            label="Frame Template"
            placeholder="Select a frame template"
            data={frameOptions}
            withAsterisk
            mb="md"
            {...form.getInputProps("frameId")}
          />
          <TextInput
            label="Owner"
            placeholder="Enter the owner of this schedule"
            mb="md"
            {...form.getInputProps(FormFields.owner)}
          />
          <Textarea
            label="Description"
            placeholder="Enter a description for this schedule"
            mb="md"
            {...form.getInputProps(FormFields.description)}
          />
        </SimpleGrid>
        <Switch
          label="open for custom timeslots"
          {...form.getInputProps("usingCustomTimeslots", { type: "checkbox" })}
        
          mt="md"
        />
        <Group mt="md">
          <Button type="submit" loading={isPending} color="cambridge">
            {submitBtnText}
          </Button>
        </Group>
      </form>
    </Card>
  );
};

export default SchedulePage;
