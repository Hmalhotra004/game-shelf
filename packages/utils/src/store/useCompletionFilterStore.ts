import { CompletionStyleType, PlatformType } from "@repo/schemas/types/index";
import { toggleIn } from "@repo/utils/lib/utils";
import { create } from "zustand";

interface State {
  search: string;
  platform: PlatformType[];
  style: CompletionStyleType[];
  lists: string[];
}

interface Actions {
  setSearch: (search: string) => void;
  setPlatform: (platform: PlatformType[]) => void;
  setStyle: (style: CompletionStyleType[]) => void;
  setLists: (list: string[]) => void;
  togglePlatform: (p: PlatformType) => void;
  toggleStyle: (s: CompletionStyleType) => void;
  toggleLists: (s: string) => void;
  reset: () => void;
}

const initialState: State = {
  search: "",
  platform: [],
  style: [],
  lists: [],
};

export const useCompletionFilterStore = create<State & Actions>()((set) => ({
  ...initialState,
  setSearch: (search) => set({ search }),
  setPlatform: (platform) => set({ platform }),
  setStyle: (style) => set({ style }),
  setLists: (lists) => set({ lists }),
  togglePlatform: (p) => set((s) => ({ platform: toggleIn(s.platform, p) })),
  toggleStyle: (st) => set((s) => ({ style: toggleIn(s.style, st) })),
  toggleLists: (ls) => set((s) => ({ lists: toggleIn(s.lists, ls) })),
  reset: () => set(initialState),
}));

// number of active non-search filters (for badges / clear button)
export const selectActiveFilterCount = (s: State) =>
  s.platform.length + s.style.length + s.lists.length;
