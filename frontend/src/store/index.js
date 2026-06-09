/**
 * Root Store Configuration
 * Zustand store setup for global state management
 */
import { create } from 'zustand';
const initialState = {
    sidebarOpen: true,
    isLoading: false,
};
export const useRootStore = create((set) => ({
    ...initialState,
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    reset: () => set(initialState),
}));
