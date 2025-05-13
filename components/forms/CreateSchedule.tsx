"use client";

import { useForm } from "@mantine/form";
import {
  Select,
  Textarea,
  Button,
  Checkbox,
  TextInput,
  LoadingOverlay,
  Paper,
  Title,
} from "@mantine/core";
import { createSchedule, ScheduleContext } from "@/app/[locale]/(tenancy)/my-tenancy/schedules/_actions/createSchedule";
import { updateSchedule } from "@/app/[locale]/(tenancy)/my-tenancy/schedules/_actions/updateSchedule";
import { getScheduleById } from "@/app/[locale]/(tenancy)/my-tenancy/schedules/_actions/getScheduleById";
import { FormActionType } from "@/types/FormActionType";
import { useActionState, useTransition } from "react";
import { useStore } from "@/store/store";
import { nanoid } from "nanoid";
import { getSyllabusAction } from "@/app/[locale]/(tenancy)/my-tenancy/schedules/_actions/getSyllabusAction";
import { FormFields } from "@/types/ScheduleTypes";
import { DayPlan, Schedule } from "@/types/ScheduleTypes";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ID, Syllabus } from "@/types/databaseTypes";
import { useTenancyBasedFormResponse } from "@/lib/hooks/useFormResponse";
import { Entities } from "@/types/Entities";
import { DataWithOptions } from "@/types/ScheduleTypes";

const formFields = Object.values(FormFields);

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
  syllabusData?: DataWithOptions<Syllabus> | null;
}

const SchedulePage = ({ 
  scheduleId, 
  scheduleData,
  syllabusData
}: SchedulePageProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(scheduleId && !scheduleData ? true : false);
  const isEditMode = !!scheduleId;
  const isInitialized = useRef(false);

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
    setDays
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
    },
    validate: {
      class: (value) => (!value ? "Class is required" : null),
      frameId: (value) => (!value ? "Frame is required" : null),
    },
    onValuesChange: async (values, previous) => {
      updateScheduleState(values, previous);

      // If class changed and name is empty, populate it
      if (values.class !== previous.class && values.class) {
        const selectedClass = classes?.[values.class];
        if (selectedClass && !values.name) {
          form.setFieldValue(FormFields.name, `Weekly schedule for ${selectedClass.NAME}`);
        }
      }

      if (values.class !== previous.class && values.class !== "") {
        // Use server-loaded syllabus if available, otherwise fetch it
        if (values.class === scheduleData?.class?.toString() && syllabusData) {
          updateSyllabus(syllabusData);
        } else {
          const newSyllabus = await getSyllabusAction(Number(values.class));
          if (!newSyllabus) {
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
          days.forEach(day => {
            deleteDay(day.id);
          });
        }
      }
    },
  });

  // Initialize data once on component mount
  useEffect(() => {
    if (isInitialized.current) return;
    
    // Reset state before initializing with new data
    resetScheduleState();
    
    // Initialize with server-provided data if available
    if (scheduleData) {
      // Update schedule state in store
      updateScheduleInStore({
        id: scheduleData.id,
        name: scheduleData.name,
        class: scheduleData.class,
        description: scheduleData.description,
        owner: scheduleData.owner,
        status: scheduleData.status,
        frameId: scheduleData.frameId,
      });
      
      // Update syllabus if provided
      if (syllabusData) {
        updateSyllabus(syllabusData);
      }
      
      // Use a Set to track day IDs for deduplication
      const dayIds = new Set();
      
      // Add days to state one by one to avoid duplicates
      scheduleData.days.forEach(day => {
        if (!dayIds.has(day.id)) {
          dayIds.add(day.id);
          addDay(day);
        }
      });
      
      // Add lessons to state
      Object.entries(scheduleData.lessons).forEach(([id, lesson]) => {
        updateScheduleInStore({
          lessons: {
            ...lessons,
            [id]: lesson
          }
        } as any); // Type cast to any to bypass type check temporarily
      });
    }
    
    isInitialized.current = true;
  }, []);

  const [isPending, startTransition] = useTransition();
  const [createState, createAction] = useActionState(createSchedule, init);
  const [updateState, updateAction] = useActionState(updateSchedule, init);

  // Define a success handler callback using useCallback to prevent unnecessary re-renders
  const handleSuccess = React.useCallback(() => {
    console.log('Schedule created/updated successfully');
    // Navigation will trigger component unmount which will reset the state
    router.push('/en/my-tenancy/schedules');
  }, [router]);

  // Call the hook directly. Its useEffect will handle the logic.
  useTenancyBasedFormResponse(
    isEditMode ? updateState : createState,
    isEditMode ? null : form, // Pass form only for create mode to reset it
    isEditMode ? 'Schedule updated successfully' : 'Schedule created successfully',
    Entities.class, // Still using Entities.class as placeholder for now
    handleSuccess
  );

  // Legacy data loading (remove this useEffect once server-side data loading is fully implemented)
  useEffect(() => {
    if (scheduleId && !scheduleData && !isInitialized.current) {
      const loadSchedule = async () => {
        setIsLoading(true);
        try {
          // Reset the state before loading new schedule to avoid any stale data
          resetScheduleState();
          
          const fetchedScheduleData = await getScheduleById(scheduleId);
          console.log("Loading schedule data:", fetchedScheduleData);

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
            });

            // Update syllabus if class is set
            if (fetchedScheduleData.class) {
              const syllabus = await getSyllabusAction(fetchedScheduleData.class);
              if (syllabus) {
                updateSyllabus(syllabus);
              }
            }

            // Update schedule state
            updateScheduleInStore({
              id: fetchedScheduleData.id,
              name: fetchedScheduleData.name,
              class: fetchedScheduleData.class,
              description: fetchedScheduleData.description,
              owner: fetchedScheduleData.owner,
              status: fetchedScheduleData.status,
              frameId: fetchedScheduleData.frameId,
            });

            // Add days to state one by one to avoid duplicates
            console.log(`Adding ${fetchedScheduleData.days.length} days to store`);
            
            // Use a Set to track day IDs for deduplication
            const dayIds = new Set();
            
            // Add scheduleId reference to each day for tracking purposes
            const daysWithScheduleId = fetchedScheduleData.days.map(day => ({
              ...day,
              scheduleId: fetchedScheduleData.id
            }));
            
            // Add all days at once using setDays for atomic update
            setDays(daysWithScheduleId);
            
            // Log template information for debugging
            daysWithScheduleId.forEach(day => {
              if (day.templateId) {
                console.log(`Day ${day.id} uses template ID: ${day.templateId}`);
              } else {
                console.log(`Day ${day.id} has no template`);
              }
            });

            // Add lessons to state
            const lessonCount = Object.keys(fetchedScheduleData.lessons).length;
            console.log(`Adding ${lessonCount} lessons to store`);
            
            Object.entries(fetchedScheduleData.lessons).forEach(([id, lesson]) => {
              updateScheduleInStore({
                lessons: {
                  ...lessons,
                  [id]: lesson
                }
              } as any); // Type cast to any to bypass type check temporarily
            });
          }
        } catch (error) {
          console.error("Error loading schedule:", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadSchedule();
    }
  }, [scheduleId]);

  const updateScheduleState = (
    values: Record<FormFields, any>,
    previous: Record<FormFields, any>
  ) => {
    formFields.forEach((element) => {
      if (values[element] !== previous[element]) {
        updateScheduleInStore({ [element]: values[element] });
      }
    });
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
      label: `${frameObj.NAME} (${frameObj.RECURRENCE === 1 ? 'Recurring' : 'Non-recurring'}, ${frameObj.NUMBER_OF_DAYS} days)`,
    }))
  ];

  // Function to update days based on the frame's NUMBER_OF_DAYS property
  const updateDaysBasedOnFrame = (numberOfDays: number) => {
    // First, clear existing days
    days.forEach(day => {
      deleteDay(day.id);
    });
    
    // Then, create the required number of days
    for (let i = 0; i < numberOfDays; i++) {
      const newDay: DayPlan = {
        id: nanoid(),
        order: String(i + 1),
        identifier: `Day ${i + 1}`,
        timeSlots: [],
        lessons: [],
        templateId: undefined,
      };
      addDay(newDay);
    }
  };

  // Update days if frameId is already set when component mounts
  useEffect(() => {
    const frameId = form.values.frameId;
    if (frameId && frameId !== CUSTOM_FRAME && frames?.[frameId]) {
      updateDaysBasedOnFrame(frames[frameId].NUMBER_OF_DAYS);
    }
  }, [frames, form.values.frameId]);

  const handleScheduleFormSubmit = (values: typeof form.values) => {
    console.log("Submitting schedule values:", values);
    
    // Create a snapshot of the current state to prevent stale data
    const currentLessons = {...lessons};
    const currentDays = [...days];
    
    startTransition(() => {
      // Build the context for submission
      const context: ScheduleContext = {
        name: values.name,
        description: values.description,
        frameId: values.frameId === CUSTOM_FRAME ? CUSTOM_FRAME : Number(values.frameId),
        class: Number(values.class),
        lessons: currentLessons,
        days: currentDays.map(day => ({
          id: day.id,
          timeSlots: day.timeSlots.map(slot => ({
            timeslotId: slot.timeslotId,
            lessonId: slot.lessonId
          })),
          templateId: day.templateId
        })),
        owner: values.owner,
      };

      console.log('Submitting form with values:', context);
      
      if (isEditMode && scheduleId) {
        updateAction({ ...context, id: scheduleId });
      } else {
        createAction(context);
      }
    });
  };

  // Add cleanup on component unmount to prevent stale state
  useEffect(() => {
    // This cleanup function runs when the component is unmounted
    return () => {
      // Reset the schedule state when navigating away from the component
      resetScheduleState();
    };
  }, []);

  return (
    <Paper p="xl" withBorder mb="xl">
      <LoadingOverlay visible={isLoading} />
      <form onSubmit={form.onSubmit(handleScheduleFormSubmit)}>
        <Title order={3} mb="md">Schedule Details</Title>
        
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
        
        <Button type="submit" loading={isPending} mb="md">
          {isEditMode ? "Update Schedule" : "Create Schedule"}
        </Button>
      </form>
    </Paper>
  );
};

export default SchedulePage;
