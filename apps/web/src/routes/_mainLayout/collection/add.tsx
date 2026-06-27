import { zodResolver } from "@hookform/resolvers/zod";
import { getByIdQueryOptions } from "@repo/utils/queries/igdb";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type z from "zod";

import { createCollectionSchema } from "@repo/schemas/schemas/collection";
import { DLCs } from "@repo/schemas/types/igdb";
import { listGetManyQueryOptions } from "@repo/utils/queries/list";

import AddDlcRow from "@/components/collection/add/AddDlcRow";
import AddGameInfoPanel from "@/components/collection/add/AddGameInfoPanel";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";

import {
  FormDatePicker,
  FormInput,
  FormMultiSelect,
  FormSelect,
} from "@/components/form/Form";

import {
  OwnershipTypeSelect,
  PCProviderSelect,
  PSProviderSelect,
  PSVersionSelect,
  PlatformSelect,
  XBOXProviderSelect,
} from "@/components/form/FormSelects";

export const Route = createFileRoute("/_mainLayout/collection/add")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search.id === "number" ? search.id : Number(search.id),
  }),
  loader: async ({ context }) => {
    const { queryClient } = context;
    await queryClient.prefetchQuery(listGetManyQueryOptions(api));
  },
  component: RouteComponent,
});

type FormValues = z.infer<typeof createCollectionSchema>;

function RouteComponent() {
  const { id } = Route.useSearch();
  const [dlcOpen, setDlcOpen] = useState(false);

  const router = useRouter();

  const { data: game, isLoading } = useQuery(getByIdQueryOptions(api, id));
  const { data: lists } = useSuspenseQuery(listGetManyQueryOptions(api));

  const listOptions = lists.map((d) => ({ label: d.name, value: d.id }));

  const form = useForm<FormValues>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      igdbId: id,
      name: "",
      dateOfPurchase: "",
      edition: null,
      amount: "",
      platform: "PC",
      provider: "Steam",
      PSVersion: "PS5",
      ownershipType: "Bought",
      image: null,
      coverImage: null,
      steamAppId: null,
      lists: null,
      isDLC: false,
      collectionId: "",
      DLCs: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "DLCs",
  });

  const watchedName = form.watch("name");
  const watchedImage = form.watch("image");

  if (game?.name && !watchedName) form.setValue("name", game.name);
  if (game?.image && !watchedImage) form.setValue("image", game.image);

  const selectedPlatform = form.watch("platform");

  // Map igdbId → field-array index for O(1) lookup
  const dlcIndexMap = new Map(fields.map((f, i) => [f.igdbId, i]));

  function toggleDlc(dlc: DLCs) {
    if (dlcIndexMap.has(dlc.id)) {
      remove(dlcIndexMap.get(dlc.id)!);
    } else {
      append({
        igdbId: dlc.id,
        name: dlc.name,
        amount: "",
        dateOfPurchase: "",
        image: dlc.image ?? null,
        coverImage: null, //TODO:Fetch
        steamAppId: null, //TODO:Fetch
        ownershipType: "Bought",
      });
    }
  }

  function onSubmit(values: FormValues) {
    console.log(values);
  }

  const isPending = false;

  if (!id)
    return <div className="p-8 text-muted-foreground">No game selected.</div>;

  if (isLoading || !game) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Loading game…
      </div>
    );
  }

  const hasDlcs = game.dlcs?.length > 0;
  const selectedCount = fields.length;

  return (
    <div className="grid grid-cols-2 flex-1 gap-4 min-h-0 overflow-hidden">
      {game && <AddGameInfoPanel game={game} />}

      <ScrollArea className="h-full min-h-0">
        <div className="flex flex-col py-4 pr-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">
              Add to Collection
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Fill in the details below to add this game to your collection.
            </p>
          </div>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="space-y-4">
              {/* Name + Edition */}
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  control={form.control}
                  name="name"
                  disabled={isPending}
                  placeholder="Game name"
                />
                <FormInput
                  control={form.control}
                  name="edition"
                  placeholder="e.g. Deluxe, GOTY, Standard"
                  disabled={isPending}
                />
              </div>

              {/* Date + Amount */}
              <div className="grid grid-cols-2 gap-4">
                <FormDatePicker
                  name="dateOfPurchase"
                  control={form.control}
                  disabled={isPending}
                />
                <FormInput
                  control={form.control}
                  name="amount"
                  disabled={isPending}
                  placeholder="e.g. 59.99"
                />
              </div>

              {/* Platform + Provider */}
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  name="platform"
                  control={form.control}
                  disabled={isPending}
                >
                  <PlatformSelect />
                </FormSelect>

                <FormSelect
                  name="provider"
                  control={form.control}
                  disabled={isPending}
                >
                  {selectedPlatform === "PS" && <PSProviderSelect />}
                  {selectedPlatform === "PC" && <PCProviderSelect />}
                  {selectedPlatform === "XBOX" && <XBOXProviderSelect />}
                </FormSelect>
              </div>

              {/* PS Version */}
              {selectedPlatform === "PS" && (
                <FormSelect
                  name="PSVersion"
                  control={form.control}
                  disabled={isPending}
                >
                  <PSVersionSelect />
                </FormSelect>
              )}

              {/* Ownership + Lists */}
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  name="ownershipType"
                  control={form.control}
                  disabled={isPending}
                >
                  <OwnershipTypeSelect />
                </FormSelect>

                <FormMultiSelect
                  control={form.control}
                  name="lists"
                  options={listOptions}
                  placeholder="Select Custom Lists"
                  disabled={isPending}
                />
              </div>
            </div>

            {hasDlcs && (
              <>
                <Separator />

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setDlcOpen((o) => !o)}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
                  >
                    {dlcOpen ? (
                      <ChevronUpIcon className="size-4 shrink-0" />
                    ) : (
                      <ChevronDownIcon className="size-4 shrink-0" />
                    )}
                    <span>
                      DLCs
                      <span className="ml-1.5 text-xs font-normal">
                        ({game.dlcs.length} available
                        {selectedCount > 0 && `, ${selectedCount} selected`})
                      </span>
                    </span>
                  </button>

                  {dlcOpen && (
                    <div className="space-y-2">
                      {game.dlcs.map((dlc) => {
                        const fieldIndex = dlcIndexMap.get(dlc.id);
                        const checked = fieldIndex !== undefined;
                        return (
                          <AddDlcRow
                            key={dlc.id}
                            dlc={dlc}
                            checked={checked}
                            onToggle={toggleDlc}
                            fieldIndex={fieldIndex}
                            control={form.control}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 sm:flex-none sm:min-w-32"
              >
                Add to Collection
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.history.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>

        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}
