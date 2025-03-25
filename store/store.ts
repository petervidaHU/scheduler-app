import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { create } from 'zustand';

interface ScheduleState {
  numberOfDays: number;
  days: any[];
  increaseNumberOfDays: () => void;
  decreaseNumberOfDays: () => void;
}

const createScheduleSlice = (set: any): ScheduleState => ({
  numberOfDays: 0,
  days: [],
  increaseNumberOfDays: () =>
    set((state: ScheduleState) => ({
      ...state,
      numberOfDays: state.numberOfDays + 1,
    })),
  decreaseNumberOfDays: () =>
    set((state: ScheduleState) => ({
      ...state,
      numberOfDays: state.numberOfDays - 1,
    })),
});

interface UserState {
  name: string;
  setName: (name: string) => void;
}

const createUserSlice = (set: any): UserState => ({
  name: '',
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
        name: 'app-storage',
        storage: createJSONStorage(() => localStorage),
      }
    ),
    { name: 'AppStoreDevTools' }
  )
);
