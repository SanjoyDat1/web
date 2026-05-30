import { create } from 'zustand'

type UIState = {
  sidebarCollapsed: boolean
  rightPanelOpen: boolean
  toggleSidebar: () => void
  openRightPanel: () => void
  closeRightPanel: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  rightPanelOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  openRightPanel: () => set({ rightPanelOpen: true }),
  closeRightPanel: () => set({ rightPanelOpen: false }),
}))
