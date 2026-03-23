import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: true,
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setOpen: (open) => set({ isOpen: open }),
    }),
    {
      name: 'felbo-sidebar-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

interface PageTitleState {
  pageTitle: string | null;
  setPageTitle: (title: string | null) => void;
}

export const usePageTitleStore = create<PageTitleState>()((set) => ({
  pageTitle: null,
  setPageTitle: (title) => set({ pageTitle: title }),
}));
