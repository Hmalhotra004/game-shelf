import { PlaythroughGetManyType } from "@repo/schemas/types/playthrough";
import { Button } from "@repo/ui/components/ui/button";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { betterTimeText, cn, getBorderColor } from "@repo/ui/lib/utils";
import { format } from "date-fns";

import { ArchiveIcon, ClockIcon, EditIcon, TrashIcon } from "lucide-react";

interface Props {
  data: PlaythroughGetManyType;
  onFinish: (playthroughId: string) => void;
}

export const PlaythroughCard3 = ({ data, onFinish }: Props) => {
  // const playPauseIcon =
  //   data.status === "On Hold" ? (
  //     <PlayIcon
  //       className={iconClassName}
  //       onClick={() => openStatusModal("Active")}
  //     />
  //   ) : (
  //     <PauseIcon
  //       className={iconClassName}
  //       onClick={() => openStatusModal("On Hold")}
  //     />
  //   );

  const isArchived = data.status === "Archived";

  return (
    <div
      className={cn(
        "flex flex-col relative w-87.5 h-110 rounded-2xl overflow-hidden bg-background shadow-xl border-2",
        getBorderColor(data.status),
      )}
    >
      <div className="relative h-30">
        <img
          src={data.customCoverImage ?? data.coverImage!}
          alt={data.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-neutral-900 via-neutral-900/70 to-transparent" />

        <div className="z-10 px-4 pb-2 absolute bottom-0 w-full">
          <h2 className="text-xl font-semibold tracking-wide text-white">
            {data.name}
          </h2>
          <p className="mt-1 text-sm text-foreground">
            {data.platform} | {data.provider} ·{" "}
            <span>{betterTimeText(data.totalSeconds)}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col flex-1 gap-y-2 px-3 pb-3 pt-3">
        <Button
          variant="ghost"
          className="w-full border border-dashed border-muted-foreground/30 hover:border-muted-foreground/80 rounded-lg text-muted-foreground hover:text-foreground bg-transparent hover:bg-background transition"
        >
          + New Entry
        </Button>

        <ScrollArea className="">
          <div className="flex flex-col gap-y-3">
            {data.sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg border border-card bg-transparent px-3 py-2"
              >
                <div className="flex items-center gap-2 text-sm">
                  {format(new Date(session.playDate), "PP")}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <ClockIcon className="size-4 pb-0.5" />{" "}
                  {betterTimeText(session.duration)}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex justify-between items-center p-2 mt-auto border-t-2">
        <div className="flex items-center gap-x-3 ml-1">
          <EditIcon className="size-4" />
          <ArchiveIcon className="size-4" />
          <TrashIcon className="size-4" />
        </div>

        <Button
          variant="secondary"
          onClick={() => onFinish(data.id)}
        >
          Finish
        </Button>
      </div>
    </div>
  );
};
