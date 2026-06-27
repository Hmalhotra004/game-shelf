import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CollectionCardVariant } from "@/components/collection/CollectionCard";

type CardVariantState = {
  variant: CollectionCardVariant;
  setVariant: (variant: CollectionCardVariant) => void;
};

export const useCardVariantStore = create<CardVariantState>()(
  persist(
    (set) => ({
      variant: "slideUp",
      setVariant: (variant) => set({ variant }),
    }),
    {
      name: "collection-card-variant",
    },
  ),
);
