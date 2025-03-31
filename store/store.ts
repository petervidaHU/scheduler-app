import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { create } from "zustand";
import { DayPlan } from "@/types/ScheduleTypes";

interface ScheduleState {
  days: DayPlan[];
  addDay: (payload: any) => void;
  deleteLastDay: () => void;
  deleteDay: (payload: any) => void;
  updateDay: (payload: any) => void;
  syllabus: any;
  updateSyllabus: (payload: any) => void;
}

const createScheduleSlice = (set: any): ScheduleState => ({
  days: [],
  syllabus: {},
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
