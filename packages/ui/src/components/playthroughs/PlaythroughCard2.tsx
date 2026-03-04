import { PlaythroughStatusType } from "@repo/schemas/types/index";
import { PlaythroughGetManyType } from "@repo/schemas/types/playthrough";
import { Button } from "@repo/ui/components/ui/button";
import { ScrollArea, ScrollBar } from "@repo/ui/components/ui/scroll-area";
import { betterTimeText, cn, secondsToHMS } from "@repo/ui/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useConfirm } from "../../hooks/useConfirm";
import AddSessionModal from "./AddSessionModal";
import PlaythroughNotes from "./PlaythroughNotes";
import UpdatePlaythroughModal from "./UpdatePlaythroughModal";
import UpdateSessionModal from "./UpdateSessionModal";

import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  EditIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";

interface Props {
  data: PlaythroughGetManyType;
  onFinish: (playthroughId: string) => void;
}

export const PlaythroughCard2 = ({ data, onFinish }: Props) => {
  const [edit, setEdit] = useState(false);
  const [openSession, setOpenSession] = useState(false);
  const [openSessionUpdate, setOpenSessionUpdate] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [playthroughStatus, setPlaythroughStatus] =
    useState<PlaythroughStatusType>("On Hold");
  const [openPlaythoughStatusUpdate, setOpenPlaythoughStatusUpdate] =
    useState(false);

  const queryClient = useQueryClient();

  const deletePlay = useMutation({});

  // const deletePlay = useMutation(
  //   trpc.playthrough.deletePlaythrough.mutationOptions({
  //     onSuccess: async () => {
  //       await queryClient.invalidateQueries(
  //         trpc.playthrough.getMany.queryOptions(),
  //       );
  //       await queryClient.invalidateQueries(trpc.stats.getStats.queryOptions());
  //       toast.success("Playthrough Deleted");
  //     },
  //     onError: (err) => {
  //       toast.error(err.message);
  //     },
  //   }),
  // );

  const deleteSession = useMutation({});

  // const deleteSession = useMutation(
  //   trpc.playthrough.deletePlaythroughTime.mutationOptions({
  //     onSuccess: async () => {
  //       await queryClient.invalidateQueries(
  //         trpc.playthrough.getMany.queryOptions(),
  //       );
  //       await queryClient.invalidateQueries(trpc.stats.getStats.queryOptions());
  //       toast.success("Session Deleted");
  //     },
  //     onError: (err) => {
  //       toast.error(err.message);
  //     },
  //   }),
  // );

  function openModal(id: string, type: "Delete" | "Update") {
    setSelectedSessionId(id);
    if (type === "Update") setOpenSessionUpdate(true);
    if (type === "Delete") handleDeleteSession();
  }

  function openStatusModal(status: PlaythroughStatusType) {
    setPlaythroughStatus(status);
    setOpenPlaythoughStatusUpdate(true);
  }

  const currentSession = selectedSessionId
    ? data.sessions.find((s) => s.id === selectedSessionId)
    : undefined;

  const iconClassName = "size-4 cursor-pointer hover:opacity-50 transition";

  function getBorderColor(status: PlaythroughStatusType) {
    switch (status) {
      case "Active":
        return "bg-emerald-600";
      case "On Hold":
        return "bg-amber-500";
      case "Archived":
        return "bg-rose-600";
    }
  }

  const playPauseIcon =
    data.status === "On Hold" ? (
      <PlayIcon
        className={iconClassName}
        onClick={() => openStatusModal("Active")}
      />
    ) : (
      <PauseIcon
        className={iconClassName}
        onClick={() => openStatusModal("On Hold")}
      />
    );

  const [ConfirmDeletePlaythrough, confirmPlaythrough] = useConfirm(
    "Delete Playthough",
    "This action cannot be undone",
    "destructive",
  );

  async function handleDeletePlaythrough() {
    const ok = await confirmPlaythrough();

    if (!ok) return;

    // deletePlay.mutateAsync({ playthroughId: data.id });
  }

  const [ConfirmDeleteSession, confirmSession] = useConfirm(
    "Delete Session",
    "This action cannot be undone",
    "destructive",
  );

  async function handleDeleteSession() {
    const ok = await confirmSession();

    if (!ok || !currentSession) return;

    // deleteSession.mutateAsync({
    //   playthroughId: data.id,
    //   playthroughSessionId: currentSession.id,
    // });
  }

  const isArchived = data.status === "Archived";

  return (
    <>
      <AddSessionModal
        open={openSession}
        setOpen={setOpenSession}
        playthroughId={data.id}
      />

      <UpdatePlaythroughModal
        open={openPlaythoughStatusUpdate}
        setOpen={setOpenPlaythoughStatusUpdate}
        playthrough={data}
        status={playthroughStatus}
      />

      {openSessionUpdate && selectedSessionId && currentSession && (
        <UpdateSessionModal
          key={`${selectedSessionId}-update`}
          open={openSessionUpdate}
          setOpen={setOpenSessionUpdate}
          session={currentSession}
        />
      )}

      <ConfirmDeletePlaythrough />

      {selectedSessionId && currentSession && <ConfirmDeleteSession />}

      <div className="flex border-2 w-87.5 h-96 rounded-md">
        <div
          className={cn(
            "flex flex-col justify-end p-1.5 py-2 border-r-2 gap-y-4 rounded-l-md",
            getBorderColor(data.status),
          )}
        >
          {edit ? (
            <XIcon
              className={cn(iconClassName, "mb-auto")}
              onClick={() => setEdit(false)}
            />
          ) : (
            <EditIcon
              className={cn(iconClassName, "mb-auto")}
              onClick={() => setEdit(true)}
            />
          )}

          {data.status === "Archived" ? (
            <ArchiveRestoreIcon
              className={iconClassName}
              onClick={() => openStatusModal("Active")}
            />
          ) : (
            <ArchiveIcon
              className={iconClassName}
              onClick={() => openStatusModal("Archived")}
            />
          )}

          {data.status === "Active" || data.status === "On Hold"
            ? playPauseIcon
            : null}

          <TrashIcon
            className={iconClassName}
            onClick={handleDeletePlaythrough}
          />
        </div>

        {edit ? (
          <PlaythroughNotes
            id={data.id}
            notes={data.notes}
            close={() => setEdit(false)}
            isArchived={isArchived}
          />
        ) : (
          <div className="flex flex-col p-3 w-full gap-y-2">
            <div className="flex gap-x-2">
              <img
                src={data.customImage ?? data.image!}
                alt={data.name}
                className="rounded-md w-17.5 h-26"
              />

              <div className="flex flex-col gap-y-0.5">
                <h2 className="font-medium">{data.name}</h2>

                <div className="flex items-center gap-x-2">
                  <p className="text-muted-foreground text-sm font-light">
                    {data.platform === "PS" ? "Playstation" : "PC"}
                  </p>
                  <p className="text-muted-foreground text-sm font-light">|</p>
                  <p className="text-muted-foreground text-sm font-light">
                    {data.provider}
                  </p>
                </div>

                {data.totalSeconds > 0 && (
                  <p className="text-muted-foreground text-sm font-light">
                    {betterTimeText(data.totalSeconds)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col flex-1">
              {!isArchived && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setOpenSession(true)}
                >
                  + Add Entry
                </Button>
              )}

              {data.sessions.length > 0 ? (
                <ScrollArea
                  className={cn(
                    "overflow-y-auto",
                    isArchived ? "h-60 mt-1" : "h-43.5",
                  )}
                >
                  <div className="flex flex-col items-center gap-1.25 mt-1">
                    {data.sessions.map((s) => {
                      return (
                        <div
                          className="flex items-center w-full justify-between"
                          key={s.id}
                        >
                          <div className="flex items-center gap-x-1.5">
                            {!isArchived && (
                              <>
                                <EditIcon
                                  className="size-3.5 hover:opacity-50 transition cursor-pointer"
                                  onClick={() => openModal(s.id, "Update")}
                                />
                                <TrashIcon
                                  className="size-3.5 hover:opacity-50 transition cursor-pointer"
                                  onClick={() => openModal(s.id, "Delete")}
                                />
                              </>
                            )}
                            <p className="text-sm">
                              {new Date(s.playDate).toLocaleDateString("in")}
                            </p>
                          </div>
                          <p className="text-sm">{secondsToHMS(s.duration)}</p>
                        </div>
                      );
                    })}
                  </div>
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              ) : (
                <h1 className="flex items-center justify-center mt-6 text-muted-foreground font-semibold tracking-wide">
                  No time recorded yet!
                </h1>
              )}
            </div>

            {!isArchived && (
              <Button
                variant="secondary"
                onClick={() => onFinish(data.id)}
              >
                Finish Playthough
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
};
