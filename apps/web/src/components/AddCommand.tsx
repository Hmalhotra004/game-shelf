import { useState } from "react";

import { searchGameQueryOptions } from "@repo/utils/queries/igdb";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ImageIcon } from "lucide-react";

import type { Dispatch, SetStateAction } from "react";

import { api } from "@/lib/api";

import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandResponsiveDialog,
} from "@/components/ui/command";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const AddCommand = ({ open, setOpen }: Props) => {
  const [search, setSearch] = useState("");
  const [submitted, setSubmitted] = useState("");
  const navigate = useNavigate();

  const {
    data: games,
    isLoading,
    isError,
  } = useQuery(searchGameQueryOptions(api, !!submitted, submitted));

  return (
    <CommandResponsiveDialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setSearch("");
          setSubmitted("");
        }
      }}
      shouldFilter={false}
    >
      <CommandInput
        placeholder="Search games..."
        value={search}
        onValueChange={setSearch}
        className="h-12 text-base"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();

            if (search.trim()) {
              setSubmitted(search.trim());
            }
          }
        }}
      />

      <CommandList>
        <CommandGroup heading="">
          {isError && (
            <div className="flex flex-1 items-center justify-center p-4">
              <p className="text-red-600 text-sm">Something went wrong</p>
            </div>
          )}

          {isLoading && (
            <div className="p-2 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 animate-pulse"
                >
                  <div className="w-12 h-16 bg-muted rounded-md" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && games?.length === 0 && (
            <CommandEmpty>
              <span className="text-muted-foreground text-sm">
                No games found
              </span>
            </CommandEmpty>
          )}

          {!isLoading &&
            games &&
            games.length > 0 &&
            games.map((game) => (
              <CommandItem
                key={game.id}
                onSelect={() => {
                  navigate({ to: "/collection/add", params: { id: game.id } });
                  setSearch("");
                  setOpen(false);
                }}
                className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-accent"
              >
                <div className="w-12 h-16 shrink-0 overflow-hidden rounded-md bg-muted flex items-center justify-center">
                  {game.coverUrl ? (
                    <img
                      src={game.coverUrl}
                      alt={game.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="size-6 text-muted-foreground" />
                  )}
                </div>

                <div className="flex flex-col overflow-hidden">
                  <p className="font-medium text-sm truncate">{game.name}</p>

                  {game.releaseYear && (
                    <span className="text-xs text-muted-foreground">
                      {game.releaseYear}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
        </CommandGroup>
      </CommandList>
    </CommandResponsiveDialog>
  );
};

export default AddCommand;
