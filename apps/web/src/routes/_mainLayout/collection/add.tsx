import { zodResolver } from "@hookform/resolvers/zod";
import { getByIdQueryOptions } from "@repo/utils/queries/igdb";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { createCollectionSchema } from "@repo/schemas/schemas/collection";
import { listGetManyQueryOptions } from "@repo/utils/queries/list";
import type z from "zod";

import AddGameInfoPanel from "@/components/collection/AddGameInfoPanel";
import { Button } from "@/components/ui/button";
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

  console.log(game);

  const { data: lists } = useSuspenseQuery(listGetManyQueryOptions(api));

  const listOptions = lists.map((d) => ({
    label: d.name,
    value: d.id,
  }));

  const form = useForm<FormValues>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
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
      hasDLCs: false,
    },
  });

  console.log(game);

  const watchedName = form.watch("name");

  if (game?.name && !watchedName) {
    form.setValue("name", game.name);
  }

  const selectedPlatform = form.watch("platform");
  const isDLC = form.watch("isDLC");

  function onSubmit(values: FormValues) {
    console.log(values);
  }

  const isPending = false;

  if (!id)
    return <div className="p-8 text-muted-foreground">No game selected.</div>;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Loading game…
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 flex-1 gap-4">
      {game && <AddGameInfoPanel game={game} />}

      <div className="flex flex-col">
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

            {/* Date and Amount */}
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

            {/* Platform and Provider */}
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

            {/* PSVersion */}
            {selectedPlatform === "PS" && (
              <FormSelect
                name="PSVersion"
                control={form.control}
                disabled={isPending}
              >
                <PSVersionSelect />
              </FormSelect>
            )}

            {/* Ownership and Lists */}
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

          <Separator />

          {game?.dlcs?.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setDlcOpen((o) => !o)}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {dlcOpen ? (
                  <ChevronUpIcon className="size-4" />
                ) : (
                  <ChevronDownIcon className="size-4" />
                )}
                Show Dlcs
              </button>

              {dlcOpen && (
                <div className="mt-4 space-y-4">
                  {/* Checkboxes */}
                  {/* <div className="flex flex-col gap-3 pt-1">
                        <FormField
                          control={form.control}
                          name="isDLC"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                This is a DLC
                              </FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hasDLCs"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Has DLCs
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div> */}

                  {/* Parent game — only shown when isDLC is true */}
                  {/* {isDLC && (
                        <FormField
                          control={form.control}
                          name="collectionId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Parent Game</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Collection ID of parent game"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )} */}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
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
    </div>
  );
}
