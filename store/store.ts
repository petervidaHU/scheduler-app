import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { create } from "zustand";
import { DayPlan, Schedule, SyllabusForm, SStatus } from "@/types/ScheduleTypes";
import { Syllabus } from "@/types/databaseTypes";
import { LessonInput, SelectOptions } from "@/types/FormActionType";
import { Toast } from "@/types/UIFeedbackTypes";
import { SpanStatus } from "next/dist/trace";

interface ScheduleState {
  days: DayPlan[];
  addDay: (payload: any) => void;
  deleteLastDay: () => void;
  deleteDay: (payload: any) => void;
  updateDay: (payload: any) => void;
  syllabus: SyllabusForm;
  updateSyllabus: (payload: any) => void;
  subjectOptions: SelectOptions[];
  teacherOptions: SelectOptions[];
  // TODO any type
  classRooms: any[];
  updateTeacherOptions: (payload: any) => void;
  updateClassRooms: (payload: any) => void;
  scheduleState: Schedule;
  updateLesson : (payload: Array<LessonInput>) => void;
  createOneLesson: (payload: LessonInput) => void;
  deleteOneLesson: (payload: string) => void;
  updateSchedule: (payload: Partial<Omit<Record<keyof Schedule, any>, "lessons">>) => void;
}

const createScheduleSlice = (set: any): ScheduleState => ({
  days: [],
  scheduleState: {
    id: '',
    status: null,
    name: null,
    class: null,
    description: null,
    owner: null,
    period: null,
    lessons: [],
  },
  subjectOptions: [],
  teacherOptions: [],
  classRooms: [],
  syllabus: {
    classId: '',
    subjects: [],
  },
  updateLesson: (payload: Array<LessonInput>) =>
    set((state: ScheduleState) => ({
      ...state,
      scheduleState: {
        ...state.scheduleState,
        lessons: payload,
      },
  })),
  createOneLesson: (payload: LessonInput) =>
    set((state: ScheduleState) => ({
      ...state,
      scheduleState: {
        ...state.scheduleState,
        lessons: [...state.scheduleState.lessons, payload],
      },
  })),
  deleteOneLesson: (payload: string) =>
    set((state: ScheduleState) => ({
      ...state,
      scheduleState: {
        ...state.scheduleState,
        lessons: state.scheduleState.lessons.filter((lesson) => lesson.tempId !== payload),
      },
  })),
  updateSchedule: (payload: Partial<Omit<Record<keyof Schedule, any>, "lessons">>) =>
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
      days: [...state.days, payload],
    })),
  deleteLastDay: () =>
    set((state: ScheduleState) => ({
      ...state,
      days: state.days.slice(0, state.days.length - 1),
    })),
  deleteDay: (payload: string) =>
    set((state: ScheduleState) => ({
      ...state,
      days: state.days.filter((day) => day.id !== payload),
    })),
  updateDay: (payload: DayPlan) =>
    set((state: ScheduleState) => ({
      ...state,
      days: [...state.days, payload],
    })),
  updateSyllabus: (payload: any) =>
    set((state: ScheduleState) => ({
      ...state,
      syllabus: payload,
    })),
  updateTeacherOptions: (payload: any) =>
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
})

type AppState = ScheduleState & scheduleGeneralState & ToastState;

export const useStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...createScheduleSlice(set),
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
