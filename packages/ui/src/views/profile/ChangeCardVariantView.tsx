import { CollectionGetMany } from "@repo/schemas/types/collection";
import { CollectionCard } from "@repo/ui/components/collection/CollectionCard";
import { Card } from "@repo/ui/components/ui/card";
import { cn } from "@repo/ui/lib/utils";
import { useCardVariantStore } from "@repo/ui/store/useCardVariantStore";
import { CheckIcon } from "lucide-react";

import {
  CollectionStatusEnum,
  PlatformEnum,
  ProviderEnum,
} from "@repo/schemas/enums/index";

export const CARD_VARIANTS = [
  {
    id: "slideUp",
    label: "Slide Up",
    description: "Steam-style hover slide details",
  },
  {
    id: "overlay",
    label: "Overlay",
    description: "Steam-style poster with bottom overlay",
  },
  {
    id: "compact",
    label: "Compact",
    description: "Classic grid card with full details",
  },
] as const;

const mockGame: CollectionGetMany = {
  id: "preview",
  name: "Hollow Knight",
  amount: "1000",
  totalAmount: 0,
  listIds: [],
  steamAppId: "",
  onlinePlaySecs: 0,
  totalPlaytime: 2000,
  status: CollectionStatusEnum.Playing,
  platform: PlatformEnum.PC,
  provider: ProviderEnum.Steam,
  dlcCount: 4,
  completions: 1,
  dateOfPurchase: new Date(),
  image:
    "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/library_600x900.jpg",
  customImage:
    "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/library_600x900.jpg",
};

export const ChangeCardVariantView = () => {
  const { variant, setVariant } = useCardVariantStore();

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h1 className="text-2xl font-semibold">Card Layout</h1>
        <p className="text-muted-foreground">
          Choose how games appear in your library
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
        {CARD_VARIANTS.map((item) => {
          const isSelected = variant === item.id;

          return (
            <Card
              key={item.id}
              onClick={() => setVariant(item.id)}
              className={cn(
                "p-4 cursor-pointer transition ring-offset-background bg-background",
                isSelected
                  ? "ring-2 ring-primary"
                  : "hover:ring-2 hover:ring-muted",
              )}
            >
              <div className="flex justify-center mb-2">
                <CollectionCard
                  game={mockGame}
                  variant={item.id}
                  showcase
                />
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div>
                  <h3 className="font-medium">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                {isSelected && <CheckIcon className="size-5 text-primary" />}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
