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
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
}

const SchedulePage = ({ scheduleId }: SchedulePageProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(scheduleId ? true : false);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const isEditMode = !!scheduleId;

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
  } = useStore();

  const [isPending, startTransition] = useTransition();
  const [createState, createAction] = useActionState(createSchedule, { ...init });
  const [updateState, updateAction] = useActionState(updateSchedule, { ...init });

  // Load schedule data if in edit mode
  useEffect(() => {
    if (scheduleId) {
      const loadSchedule = async () => {
        setIsLoading(true);
        try {
          const scheduleData = await getScheduleById(scheduleId);
          setSchedule(scheduleData);

          // Clear existing schedule state
          days.forEach(day => deleteDay(day.id));

          if (scheduleData) {
            // Update form values with schedule data
            form.setValues({
              name: scheduleData.name || "",
              class: scheduleData.class?.toString() || "",
              description: scheduleData.description || "",
              owner: scheduleData.owner?.toString() || "",
              status: scheduleData.status || "DRAFT",
              frameId: scheduleData.frameId?.toString() || "",
              variations: "",
            });

            // Update syllabus if class is set
            if (scheduleData.class) {
              const syllabus = await getSyllabusAction(scheduleData.class);
              if (syllabus) {
                updateSyllabus(syllabus);
              }
            }

            // Update schedule state
            updateScheduleInStore({
              id: scheduleData.id,
              name: scheduleData.name,
              class: scheduleData.class,
              description: scheduleData.description,
              owner: scheduleData.owner,
              status: scheduleData.status,
              frameId: scheduleData.frameId,
            });

            // Add days to state
            scheduleData.days.forEach(day => {
              addDay(day);
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

  const form = useForm({
    initialValues: {
      [FormFields.name]: "",
      [FormFields.class]: "",
      [FormFields.description]: "",
      [FormFields.owner]: "",
      [FormFields.status]: "DRAFT",
      frameId: "",
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
        const newSyllabus = await getSyllabusAction(Number(values.class));

        if (!newSyllabus) {
          return;
        }

        updateSyllabus(newSyllabus);
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

  // Effect to handle success states
  useEffect(() => {
    const state = isEditMode ? updateState : createState;
    if (state.success) {
      const scheduleId = state.data?.id;
      // Redirect to the schedule view page or stay on edit page
      if (scheduleId && !isEditMode) {
        router.push(`/en/my-tenancy/schedules?scheduleId=${scheduleId}`);
      }
    }
  }, [createState, updateState]);

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
    if (!isEditMode) {
      const frameId = form.values.frameId;
      if (frameId && frameId !== CUSTOM_FRAME && frames?.[frameId]) {
        updateDaysBasedOnFrame(frames[frameId].NUMBER_OF_DAYS);
      }
    }
  }, [frames, isEditMode]);

  const handleAddDay = (event: React.MouseEvent<HTMLButtonElement>) => {
    const newDay: DayPlan = {
      id: nanoid(),
      order: String(days.length + 1),
      identifier: `Day ${days.length + 1}`,
      timeSlots: [],
      lessons: [],
      templateId: undefined,
    };
    addDay(newDay);
  };

  const handleScheduleFormSubmit = (values: typeof form.values) => {
    if (!values.class || !values.frameId) {
      return;
    }

    const scheduleContext: ScheduleContext = {
      frameId: values.frameId === CUSTOM_FRAME ? CUSTOM_FRAME : Number(values.frameId),
      days: days,
      lessons: lessons,
      name: values.name,
      class: Number(values.class),
      description: values.description,
      owner: values.owner || "",
    };

    startTransition(() => {
      if (isEditMode && scheduleId) {
        // Update existing schedule
        updateAction({
          ...scheduleContext,
          id: scheduleId
        });
      } else {
        // Create new schedule
        createAction(scheduleContext);
      }
    });
  };

  return (
    <Paper p="md" withBorder pos="relative">
      <LoadingOverlay visible={isLoading} />
      
      <form onSubmit={form.onSubmit(handleScheduleFormSubmit)}>
        <Title order={4} mb="md">{isEditMode ? 'Edit Schedule' : 'Create New Schedule'}</Title>
        
        <Select
          label="Class"
          name={FormFields.class}
          data={classOptions}
          value={form.values.class}
          onChange={(value) => form.setFieldValue(FormFields.class, value || "")}
          required
          mb="sm"
        />

        <Select
          label="Frame"
          name="frameId"
          data={frameOptions}
          value={form.values.frameId}
          onChange={(value) => form.setFieldValue("frameId", value || "")}
          placeholder="Select a frame"
          required
          mb="sm"
        />

        {/* Show Add Day button only when Custom Frame is selected */}
        {form.values.frameId === CUSTOM_FRAME && (
          <Button onClick={handleAddDay} mt="sm" mb="sm">
            Add Day
          </Button>
        )}

        <TextInput
          label="Name"
          name={FormFields.name}
          value={form.values.name}
          onChange={(event) => form.setFieldValue(FormFields.name, event.currentTarget.value)}
          mb="sm"
        />

        <TextInput
          label="Owner"
          name={FormFields.owner}
          value={form.values.owner}
          onChange={(event) => form.setFieldValue(FormFields.owner, event.currentTarget.value)}
          mb="sm"
        />

        <Textarea
          label="Description"
          name={FormFields.description}
          value={form.values.description}
          onChange={(event) => form.setFieldValue(FormFields.description, event.currentTarget.value)}
          mb="lg"
        />

        <Button 
          type="submit" 
          loading={isPending} 
          disabled={isLoading}
        >
          {isEditMode ? 'Update Schedule' : 'Create Schedule'}
        </Button>
      </form>
    </Paper>
  );
};

export default SchedulePage;
