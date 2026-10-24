import { create } from "zustand";

type UpdateStore = {
  dismissed: string | null;
  setDismissed: (v: string | null) => void;
};

export const useUpdateStore = create<UpdateStore>((set) => ({
  dismissed: null,
  setDismissed: (dismissed) => set({ dismissed }),
}));
