import { create } from "zustand";

interface NewRoadmapState {
  userGoal: string;
  isLoading: boolean;
  isNewUser: boolean;
  setUserGoal: (goal: string) => void;
  setIsLoading: (loading: boolean) => void;
  setIsNewUser: (isNew: boolean) => void;
  resetStore: () => void;
}

const initialState = {
  userGoal: "",
  isLoading: false,
  isNewUser: true,
};

export const useNewRoadmapStore = create<NewRoadmapState>((set) => ({
  ...initialState,
  setUserGoal: (goal) => set({ userGoal: goal }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsNewUser: (isNew) => set({ isNewUser: isNew }),
  resetStore: () => set(initialState),
}));
