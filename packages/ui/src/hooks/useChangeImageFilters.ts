import { useCardVariantStore } from "@repo/ui/store/useCardVariantStore";

import { parseAsBoolean, parseAsStringLiteral, useQueryStates } from "nuqs";

export const useChangeImageFilters = () => {
  const v = useCardVariantStore((s) => s.variant);

  const [filters, setFilters] = useQueryStates({
    cardType: parseAsStringLiteral([
      "compact",
      "overlay",
      "slideUp",
    ] as const).withDefault(v),

    imageOnly: parseAsBoolean.withDefault(false),
    nsfw: parseAsBoolean.withDefault(false),
    directLink: parseAsBoolean.withDefault(false),
  });

  return [filters, setFilters] as const;
};
