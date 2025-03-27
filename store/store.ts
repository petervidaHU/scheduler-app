import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { create } from "zustand";
import { DayPlan } from "@/types/ScheduleTypes";

interface ScheduleState {
  days: DayPlan[];
  addDay: (payload: any) => void;
  deleteLastDay: () => void;
  deleteDay: (payload: any) => void;
  updateDay: (payload: any) => void;
}

const createScheduleSlice = (set: any): ScheduleState => ({
  days: [],
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
});

interface UserState {
  name: string;
  setName: (name: string) => void;
}

const createUserSlice = (set: any): UserState => ({
  name: "",
  setName: (name: string) => set(() => ({ name })),
});

type AppState = ScheduleState & UserState;

export const useStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...createScheduleSlice(set),
        ...createUserSlice(set),
      }),
      {
        name: "app-storage",
        storage: createJSONStorage(() => localStorage),
      }
    ),
    { name: "AppStoreDevTools" }
  )
);
