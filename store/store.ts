import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { create } from "zustand";
import {
  DayPlan,
  Schedule,
  SyllabusForm,
  TenancyBasedData,
  DataWithOptions,
  SyllabusWithOptions,
} from "@/types/ScheduleTypes";
import {
  Classes,
  ClassRoom,
  ID,
  Specialty,
  Subject,
  Teacher,
  TimeslotInput,
  Timeslots,
  Frame,
} from "@/types/databaseTypes";
import { LessonInput, PreloadDataObject } from "@/types/FormActionType";
import { Toast } from "@/types/UIFeedbackTypes";

interface ScheduleState {
  //Tenancy based data
  tenancyBasedData: {
    specialties: PreloadDataObject<DataWithOptions<Specialty>>;
    subjects: PreloadDataObject<DataWithOptions<Subject>>;
    teachers: PreloadDataObject<DataWithOptions<Teacher>>;
    classes: PreloadDataObject<DataWithOptions<Classes>>;
    classRooms: PreloadDataObject<DataWithOptions<ClassRoom>>;
    frames: PreloadDataObject<DataWithOptions<Frame>>;
  };

  //Schedule
  scheduleState: Schedule;
  syllabus: SyllabusWithOptions;

  //Timeslots
  activeTimeslots: Record<number, TimeslotInput>;
  activeTemplate: {
    id: number | null;
    name: string;
    description: string;
  };

  //Reducers
  fillTenancyBasedData: (payload: TenancyBasedData) => void;
  updateTenancyBasedData: (payload: Partial<TenancyBasedData>) => void;
  addDay: (payload: any) => void;
  deleteDay: (payload: any) => void;
  // updateDay: (payload: any) => void;
  updateSyllabus: (payload: any) => void;
  updateTeachers: (payload: any) => void;
  updateClassRooms: (payload: any) => void;
  updateLesson: (payload: LessonInput) => void;
  createOneLesson: (payload: {
    dayId: string;
    newLesson: LessonInput;
    timeslotId: ID;
  }) => void;
  deleteOneLesson: (payload: string) => void;
  updateSchedule: (
    payload: Partial<Omit<Record<keyof Schedule, any>, "lessons">>
  ) => void;
  addTimeslotToDay: (payload: { dayId: string; timeslotId: number; templateId?: string }) => void;
  resetScheduleState: () => void;
  setDays: (days: DayPlan[]) => void;

  addActiveTimeslot: (payload: TimeslotInput) => void;
  removeActiveTimeslot: (payload: ID) => void;
  selectActiveTimeslot: (payload: ID) => TimeslotInput;
  updateDayTemplateId: (dayId: string, templateId: string) => void;
}

const createScheduleSlice = (set: any, get: any): ScheduleState => ({
  tenancyBasedData: {
    specialties: {},
    subjects: {},
    teachers: {},
    classRooms: {},
    classes: {},
    frames: {},
  },
  scheduleState: {
    id: "",
    status: null,
    name: null,
    class: null,
    description: null,
    owner: null,
    frameId: null,
    lessons: {},
    days: [],
  },

  syllabus: {} as SyllabusWithOptions,

  activeTimeslots: {},
  activeTemplate: {
    id: null,
    name: "",
    description: "",
  },

  addActiveTimeslot: (payload: TimeslotInput) =>
    set((state: ScheduleState) => ({
      ...state,
      activeTimeslots: {
        ...state.activeTimeslots,
        [payload.ID]: payload,
      },
    })),
  removeActiveTimeslot: (payload: number) =>
    set((state: ScheduleState) => {
      const oldTimeslots = state.activeTimeslots;
      delete oldTimeslots[payload];
      return {
        ...state,
        activeTimeslots: {
          ...oldTimeslots,
        },
      };
    }),
  selectActiveTimeslot: (payload: number) =>
    get().activeTimeslots[payload],

/*   addTimeslotToSchedule: (payload: Record<string, Timeslots>) =>
    set((state: ScheduleState) => ({
      ...state,
      scheduleState: {
        ...state.scheduleState,
        timeslots: {
          ...state.scheduleState.timeslots,
          ...payload,
        },
      },
    })), */
  addTimeslotToDay: (payload: { dayId: string; timeslotId: number; templateId?: string }) =>
    set((state: ScheduleState) => {
      const day = state.scheduleState.days.find((d) => d.id === payload.dayId);
      if (!day) {
        console.error(`Day with ID ${payload.dayId} not found`);
        return state;
      }
      
      // If a template is provided, update the templateId first
      const updatedTemplateId = payload.templateId || day.templateId;
      
      // Add the new timeslot if it doesn't exist already
      const existingTimeslotIndex = day.timeSlots.findIndex(slot => 
        slot.timeslotId === payload.timeslotId);
      
      // Only add timeslot if it doesn't exist yet
      let updatedTimeSlots = [...day.timeSlots];
      if (existingTimeslotIndex === -1) {
        updatedTimeSlots.push({ timeslotId: payload.timeslotId });
      } else {
      }
      
      return {
        ...state,
        scheduleState: {
          ...state.scheduleState,
          days: state.scheduleState.days.map((d) =>
            d.id === payload.dayId ? { 
              ...d, 
              timeSlots: updatedTimeSlots,
              templateId: updatedTemplateId
            } : d
          ),
        },
      };
    }),
  fillTenancyBasedData: (payload: TenancyBasedData) =>
    set((state: ScheduleState) => ({
      ...state,
      tenancyBasedData: {
        subjects: { ...payload.subjects },
        teachers: { ...payload.teachers },
        classRooms: { ...payload.classRooms },
        classes: { ...payload.classes },
        specialties: { ...payload.specialties },
        frames: { ...payload.frames },
      },
    })),
  updateTenancyBasedData: (payload: Partial<TenancyBasedData>) =>
    set((state: ScheduleState) => ({
      ...state,
      tenancyBasedData: {
        ...state.tenancyBasedData,
        ...payload,
      },
    })),
  updateLesson: (payload: LessonInput) =>
    set((state: ScheduleState) => ({
      ...state,
      scheduleState: {
        ...state.scheduleState,
        lessons: {
          ...state.scheduleState.lessons,
          [payload.id]: { ...payload },
        },
      },
    })),
  createOneLesson: (payload: {
    dayId: string;
    newLesson: LessonInput;
    timeslotId: ID;
  }) =>
    set((state: ScheduleState) => {
      const days = state.scheduleState.days;
      console.log("days", days, payload.dayId)
      const newdayIndex = state.scheduleState.days.findIndex(
        (day) => day.id === payload.dayId
      );
      console.log("newdayIndex", newdayIndex)
      const timeSlotIndex = days[newdayIndex].timeSlots?.findIndex(
        (timeSlot) => timeSlot.timeslotId === payload.timeslotId
      );
      console.log("timeSlotIndex", timeSlotIndex)
      if (newdayIndex < 0 || timeSlotIndex < 0) {
        console.log("store error", newdayIndex, timeSlotIndex);
        return state;
      }
      days[newdayIndex].timeSlots[timeSlotIndex].lessonId =
        payload.newLesson.id;
      console.log("days in store:", days);
      return {
        ...state,
        scheduleState: {
          ...state.scheduleState,
          lessons: {
            ...state.scheduleState.lessons,
            [payload.newLesson.id]: { ...payload.newLesson },
          },
          days: days,
        },
      };
    }),
  deleteOneLesson: (payload: string) =>
    set((state: ScheduleState) => {
      const newLessons = state.scheduleState.lessons;
      delete newLessons[payload];

      // Update days to remove the lessonId from timeSlots
      const updatedDays = state.scheduleState.days.map(day => ({
        ...day,
        timeSlots: day.timeSlots.map(slot => 
          slot.lessonId === payload 
            ? { ...slot, lessonId: undefined }
            : slot
        )
      }));

      return {
        ...state,
        scheduleState: {
          ...state.scheduleState,
          lessons: newLessons,
          days: updatedDays,
        },
      };
    }),
  updateSchedule: (
    payload: Partial<Omit<Record<keyof Schedule, any>, "lessons">>
  ) =>
    set((state: ScheduleState) => ({
      ...state,
      scheduleState: {
        ...state.scheduleState,
        ...payload,
      },
    })),
  addDay: (payload: DayPlan) =>
    set((state: ScheduleState) => {
      // Check if a day with this ID already exists
      const dayExists = state.scheduleState.days.some(day => day.id === payload.id);
      
      // If the day already exists, don't add it again
      if (dayExists) {
        console.log(`Day with ID ${payload.id} already exists, not adding duplicate`);
        return state; // Return state unchanged
      }
      
      // Day doesn't exist yet, add it
      return {
        ...state,
        scheduleState: {
          ...state.scheduleState,
          days: [...state.scheduleState.days, payload],
        },
      };
    }),
  deleteDay: (payload: string) =>
    set((state: ScheduleState) => ({
      ...state,
      scheduleState: {
        ...state.scheduleState,
        days: state.scheduleState.days.filter((day) => day.id !== payload),
      },
    })),
  /*  updateDay: (payload: DayPlan) =>
    set((state: ScheduleState) => ({
      ...state,
      scheduleState: {
        ...state.scheduleState,
        days: state.scheduleState.days.filter((day) => day.id !== payload),
      },
    })), */
  updateSyllabus: (payload: any) =>
    set((state: ScheduleState) => ({
      ...state,
      syllabus: payload,
    })),
  updateTeachers: (payload: any) =>
    set((state: ScheduleState) => ({
      ...state,
      teacherOptions: payload,
    })),
  updateClassRooms: (payload: any) =>
    set((state: ScheduleState) => ({
      ...state,
      classRooms: payload,
    })),
  resetScheduleState: () =>
    set((state: ScheduleState) => ({
      ...state,
      scheduleState: {
        id: "",
        status: null,
        name: null,
        class: null,
        description: null,
        owner: null,
        frameId: null,
        lessons: {},
        days: [],
      },
      syllabus: {} as SyllabusWithOptions,
      activeTimeslots: {},
    })),
  setDays: (days: DayPlan[]) =>
    set((state: ScheduleState) => ({
      ...state,
      scheduleState: {
        ...state.scheduleState,
        days: days,
      },
    })),
  updateDayTemplateId: (dayId: string, templateId: string) =>
    set((state: ScheduleState) => ({
      scheduleState: {
        ...state.scheduleState,
        days: state.scheduleState.days.map((day) =>
          day.id === dayId ? { ...day, templateId } : day
        ),
      },
    })),
});

interface scheduleGeneralState {
  windowHeight: number;
  setWindowHeight: (h: number) => void;
}

const scheduleGeneralSlice = (set: any): scheduleGeneralState => ({
  windowHeight: 1440,
  setWindowHeight: (h: number) => set(() => ({ windowHeight: h })),
});

interface ToastState {
  toast: Toast[];
  addToast: (payload: Toast) => void;
  removeToast: (payload: string) => void;
}

const toastSlice = (set: any): ToastState => ({
  toast: [],
  addToast: (payload: any) =>
    set((state: ToastState) => ({
      ...state,
      toast: [...state.toast, payload],
    })),
  removeToast: (payload: any) =>
    set((state: ToastState) => ({
      ...state,
      toast: state.toast.filter((toast) => toast.id !== payload),
    })),
});

type AppState = ScheduleState & scheduleGeneralState & ToastState;

export const useStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...createScheduleSlice(set, get),
        ...scheduleGeneralSlice(set),
        ...toastSlice(set),
      }),
      {
        name: "app-storage",
        storage: createJSONStorage(() => localStorage),
      }
    ),
    { name: "AppStoreDevTools" }
  )
);
