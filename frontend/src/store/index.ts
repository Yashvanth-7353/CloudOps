/**
 * Root Store Configuration
 * Zustand store setup for global state management
 */

import { create } from 'zustand';

interface RootStore {
  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // Global Loading
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Reset function
  reset: () => void;
}

const initialState = {
  sidebarOpen: true,
  isLoading: false,
};

export const useRootStore = create<RootStore>((set) => ({
  ...initialState,

  setSidebarOpen: (open: boolean) =>
    set({ sidebarOpen: open }),

  setIsLoading: (loading: boolean) =>
    set({ isLoading: loading }),

  reset: () =>
    set(initialState),
}));
