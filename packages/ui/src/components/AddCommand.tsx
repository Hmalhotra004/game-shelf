"use client";

import { useTRPC } from "@/trpc/client";
import { addDLCType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Spinner } from "./ui/spinner";

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
  onClick?: (dlc: addDLCType) => void;
}

const AddCommand = ({ open, setOpen, onClick }: Props) => {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const router = useRouter();
  const trpc = useTRPC();

  const {
    data: games,
    isLoading,
    isError,
  } = useQuery(
    trpc.searchUnified.search.queryOptions(
      { query: debounced },
      { enabled: debounced.length > 0 }
    )
  );

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 1000);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <CommandResponsiveDialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setSearch("");
      }}
      shouldFilter={false}
    >
      <CommandInput
        placeholder="Find a game to add..."
        value={search}
        onValueChange={(value) => setSearch(value)}
      />

      <CommandList>
        <CommandGroup heading="">
          {isError && (
            <div className="flex flex-1 items-center justify-center p-4">
              <p className="text-red-600 text-sm">Something went wrong</p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-1 items-center justify-center p-4">
              <Spinner />
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
                  if (onClick) {
                    onClick({
                      name: game.name,
                      image: game.image,
                      coverImage: game.coverImage,
                      steamAppId:
                        game.platform === "Steam" ? game.steamAppId : "",
                    });
                  } else {
                    let steamAppId;

                    if (game.platform === "Steam") steamAppId = game.steamAppId;

                    router.push(
                      `/collection/add?name=${game.name}&coverImg=${game.coverImage}&img=${game.image}&steamAppId=${steamAppId}`
                    );
                  }
                  setSearch("");
                  setOpen(false);
                }}
                className="cursor-pointer"
              >
                {game.image ? (
                  <Image
                    src={game.image}
                    alt="img"
                    width={50}
                    height={50}
                    className="rounded-sm"
                  />
                ) : (
                  <ImageIcon
                    className="size-10"
                    width={90}
                    height={90}
                  />
                )}
                <div className="flex flex-col items-start justify-end">
                  <p className="font-medium">{game.name}</p>
                </div>
              </CommandItem>
            ))}
        </CommandGroup>
      </CommandList>
    </CommandResponsiveDialog>
  );
};

export default AddCommand;
