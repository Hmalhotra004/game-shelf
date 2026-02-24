"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormTextarea } from "@repo/ui/components/form/Form";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import {
  updatePlaythroughNotesSchema,
  UpdatePlaythroughNotesSchemaType,
} from "@repo/schemas/schemas/playthrough";

interface Props {
  id: string;
  notes: string | null;
  close: () => void;
  isArchived: boolean;
}

const MAX_CHARS = 250;

const PlaythroughNotes = ({ id, notes, close, isArchived }: Props) => {
  const queryClient = useQueryClient();

  const updateNotes = useMutation({});

  // const updateNotes = useMutation(
  //   trpc.playthrough.updatePlaythroughNotes.mutationOptions({
  //     onSuccess: async () => {
  //       await queryClient.invalidateQueries(
  //         trpc.playthrough.getMany.queryOptions()
  //       );
  //       toast.success("Updated");
  //       close?.();
  //     },
  //     onError: (err) => toast.error(err.message),
  //   })
  // );

  const form = useForm<UpdatePlaythroughNotesSchemaType>({
    resolver: zodResolver(updatePlaythroughNotesSchema),
    defaultValues: {
      notes: notes ?? null,
    },
  });

  async function onSubmit(values: UpdatePlaythroughNotesSchemaType) {
    // updateNotes.mutateAsync({ playthroughId: id, notes: values.notes });
  }

  const noteValue = form.watch("notes") ?? "";
  const remaining = noteValue.length;

  const isPending = updateNotes.isPending;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex h-full flex-col gap-y-2 p-3 flex-1"
    >
      <div className="flex flex-col gap-y-2">
        <FormTextarea
          name="notes"
          control={form.control}
          placeholder="Notes"
          disabled={isPending || isArchived}
          className={cn(
            "resize-none max-w-72.5 mx-auto ",
            isArchived ? "h-89" : "h-65",
          )}
        />

        {!isArchived && (
          <span
            className={cn(
              "text-xs ml-auto mr-1",
              remaining < 0 ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {remaining} / {MAX_CHARS}
          </span>
        )}
      </div>

      {!isArchived && (
        <div className="flex items-center justify-between mt-auto">
          <Button
            variant="ghost"
            onClick={close}
            type="button"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            type="submit"
            disabled={isPending || remaining < 0}
          >
            Update
          </Button>
        </div>
      )}
    </form>
  );
};

export default PlaythroughNotes;
