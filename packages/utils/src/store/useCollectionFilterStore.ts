import { toggleIn } from "@repo/utils/lib/utils";
import { create } from "zustand";

import {
  PlatformType as Platform,
  CollectionStatusType as StatusType,
} from "@repo/schemas/types/index";

export type PlatformType = Platform;
export type CollectionStatusType = StatusType;

interface State {
  search: string;
  platform: PlatformType[];
  status: CollectionStatusType[];
  lists: string[];
}

interface Actions {
  setSearch: (search: string) => void;
  setPlatform: (platform: PlatformType[]) => void;
  setStatus: (status: CollectionStatusType[]) => void;
  setLists: (list: string[]) => void;
  togglePlatform: (p: PlatformType) => void;
  toggleStatus: (s: CollectionStatusType) => void;
  toggleLists: (s: string) => void;
  reset: () => void;
}

const initialState: State = {
  search: "",
  platform: [],
  status: [],
  lists: [],
};

export const useCollectionFilterStore = create<State & Actions>()((set) => ({
  ...initialState,
  setSearch: (search) => set({ search }),
  setPlatform: (platform) => set({ platform }),
  setStatus: (status) => set({ status }),
  setLists: (lists) => set({ lists }),
  togglePlatform: (p) => set((s) => ({ platform: toggleIn(s.platform, p) })),
  toggleStatus: (st) => set((s) => ({ status: toggleIn(s.status, st) })),
  toggleLists: (ls) => set((s) => ({ lists: toggleIn(s.lists, ls) })),
  reset: () => set(initialState),
}));

// number of active non-search filters (for badges / clear button)
export const selectActiveFilterCount = (s: State) =>
  s.platform.length + s.status.length + s.lists.length;
