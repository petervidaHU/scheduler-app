import { create } from "zustand";

type UiState = {
  demoClicks: number;
  incrementDemoClicks: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  demoClicks: 0,
  incrementDemoClicks: () =>
    set((state) => ({ demoClicks: state.demoClicks + 1 })),
}));
