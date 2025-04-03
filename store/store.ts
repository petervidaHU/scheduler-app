import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { create } from "zustand";
import { DayPlan, SyllabusForm } from "@/types/ScheduleTypes";
import { Syllabus } from "@/types/databaseTypes";
import { SelectOptions } from "@/types/FormActionType";

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
}

const createScheduleSlice = (set: any): ScheduleState => ({
  days: [],
  subjectOptions: [],
  teacherOptions: [],
  classRooms: [],
  syllabus: {
    subjects: [],
  },
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

type AppState = ScheduleState & scheduleGeneralState;

export const useStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...createScheduleSlice(set),
        ...scheduleGeneralSlice(set),
      }),
      {
        name: "app-storage",
        storage: createJSONStorage(() => localStorage),
      }
    ),
    { name: "AppStoreDevTools" }
  )
);
