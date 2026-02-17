import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@repo/ui/lib/api";
import { cn } from "@repo/ui/lib/utils";
import { CollectionQueryKeys } from "@repo/ui/queries/collection/collection.keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { FormInput } from "../form/Form";
import { Button } from "../ui/button";
import ResponsiveDialog from "../ui/responsive-dialog";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

interface Props {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  name: string;
  collectionId: string;
}

const formSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(1, { error: "Name is required" }),
});

type resultType = {
  id: string;
  name: string;
  release_date: string;
};

export const LinkGameModal = ({
  onOpenChange,
  open,
  name,
  collectionId,
}: Props) => {
  const [id, setId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: name },
  });

  const watchedName = form.watch("name") ?? "";
  const [debouncedSearch, setDebouncedSearch] = useState<string>(watchedName);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(watchedName), 2000);
    return () => clearTimeout(t);
  }, [watchedName]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: CollectionQueryKeys.linkSteamGrid(debouncedSearch),
    queryFn: async () => {
      const response = await api.get<resultType[]>(
        `/steamGridDB/linkGame?name=${encodeURIComponent(debouncedSearch)}`,
      );

      return response.data;
    },
    enabled: !!debouncedSearch && debouncedSearch.trim().length > 0,
  });

  const update = useMutation({
    mutationFn: async (steamGridDBId: string) => {
      await api.patch(
        `/collection/${collectionId}/update/steamGridDB/${steamGridDBId}`,
      );
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: CollectionQueryKeys.getById(collectionId),
      });
      onOpenChange(false);
    },
  });

  const isPending = isLoading || isFetching || update.isPending;

  async function onSubmit(steamGridDBId: string) {
    await update.mutateAsync(steamGridDBId);
  }

  return (
    <ResponsiveDialog
      title="Link Game"
      description="This is a one time process requried to link the game to steamGridDB. Once linked, the game will be able to fetch images and other metadata from steamGridDB."
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col gap-4">
        <FormInput
          name="name"
          control={form.control}
          disabled={isPending}
          placeholder="Name"
        />

        {(isLoading || isFetching) && (
          <p className="ml-1 text-sm">Searching…</p>
        )}

        {((!isPending && !data) || data?.length === 0) && (
          <p className="text-sm ml-1 text-gray-500">No results</p>
        )}

        {data && data.length > 0 && (
          <ScrollArea className="h-73">
            <div className="flex flex-col gap-2">
              {data.map((g) => {
                return (
                  <button
                    key={g.id}
                    className={cn(
                      "flex items-center gap-2 p-2 pr-4 rounded border justify-between cursor-pointer",
                      id === g.id && "border-emerald-600",
                    )}
                    onClick={() => setId(g.id)}
                  >
                    <p className="font-medium">{g.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {g.release_date
                        ? new Date(Number(g.release_date) * 1000).getFullYear()
                        : "Unknown"}
                    </p>
                  </button>
                );
              })}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        )}

        <Button
          disabled={!id || isPending}
          onClick={() => onSubmit(id!)}
        >
          Link
        </Button>
      </div>
    </ResponsiveDialog>
  );
};
