import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { create } from "zustand";
import {
  DayPlan,
  Schedule,
  SyllabusForm,
  TenancyBasedData,
  DataWithOptions,
} from "@/types/ScheduleTypes";
import {
  Classes,
  ClassRoom,
  Specialty,
  Subject,
  Teacher,
  TimeslotInput,
  Timeslots,
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
  };

  //Schedule
  scheduleState: Schedule;
  syllabus: SyllabusForm;

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
    timeslotId: string;
  }) => void;
  deleteOneLesson: (payload: string) => void;
  updateSchedule: (
    payload: Partial<Omit<Record<keyof Schedule, any>, "lessons">>
  ) => void;
  addTimeslotToSchedule: (payload: Record<string, Timeslots>) => void;
  addTimeslotToDay: (payload: { dayId: string; timeslotId: string }) => void;

  addActiveTimeslot: (payload: TimeslotInput) => void;
  removeActiveTimeslot: (payload: number) => void;
  selectActiveTimeslot: (payload: number) => TimeslotInput;
}

const createScheduleSlice = (set: any, get: any): ScheduleState => ({
  tenancyBasedData: {
    specialties: {},
    subjects: {},
    teachers: {},
    classRooms: {},
    classes: {},
  },
  scheduleState: {
    id: "",
    status: null,
    name: null,
    class: null,
    description: null,
    owner: null,
    period: null,
    lessons: {},
    timeslots: {},
    days: [],
  },

  syllabus: {
    classId: 0,
    subjects: {},
  },

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

  addTimeslotToSchedule: (payload: Record<string, Timeslots>) =>
    set((state: ScheduleState) => ({
      ...state,
      scheduleState: {
        ...state.scheduleState,
        timeslots: {
          ...state.scheduleState.timeslots,
          ...payload,
        },
      },
    })),
  addTimeslotToDay: (payload: { dayId: string; timeslotId: string }) =>
    set((state: ScheduleState) => {
      const oldDays =
        state.scheduleState.days.find((day) => day.id === payload.dayId)
          ?.timeSlots || [];
      const timeSlots = state.scheduleState.timeslots;
      oldDays.push({ timeslotId: payload.timeslotId });
      return {
        ...state,
        scheduleState: {
          ...state.scheduleState,
          days: state.scheduleState.days.map((day) =>
            day.id === payload.dayId ? { ...day, timeSlots: oldDays } : day
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
          [payload.tempId]: { ...payload },
        },
      },
    })),
  createOneLesson: (payload: {
    dayId: string;
    newLesson: LessonInput;
    timeslotId: string;
  }) =>
    set((state: ScheduleState) => {
      const days = state.scheduleState.days;
      const newdayIndex = state.scheduleState.days.findIndex(
        (day) => day.id === payload.dayId
      );
      const timeSlotIndex = days[newdayIndex].timeSlots?.findIndex(
        (timeSlot) => timeSlot.timeslotId === payload.timeslotId
      );
      if (newdayIndex < 0 || timeSlotIndex < 0) {
        console.log("store error", newdayIndex, timeSlotIndex);
        return state;
      }
      days[newdayIndex].timeSlots[timeSlotIndex].lessonId =
        payload.newLesson.tempId;
      console.log("days in store:", days);
      return {
        ...state,
        scheduleState: {
          ...state.scheduleState,
          lessons: {
            ...state.scheduleState.lessons,
            [payload.newLesson.tempId]: { ...payload.newLesson },
          },
          days: days,
        },
      };
    }),
  // TODO update days lesson array as well!
  deleteOneLesson: (payload: string) =>
    set((state: ScheduleState) => {
      const newLessons = state.scheduleState.lessons;
      delete newLessons[payload];

      return {
        ...state,
        scheduleState: {
          ...state.scheduleState,
          lessons: newLessons,
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
    set((state: ScheduleState) => ({
      ...state,
      scheduleState: {
        ...state.scheduleState,
        days: [...state.scheduleState.days, payload],
      },
    })),
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
