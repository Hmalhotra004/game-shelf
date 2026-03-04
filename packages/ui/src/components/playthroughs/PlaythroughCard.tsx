// import { PlaythroughGetManyType } from "@repo/schemas/types/playthrough";
// import { betterTimeText, cn, getBorderColor } from "@repo/ui/lib/utils";
// import { format } from "date-fns";
// import { ArchiveIcon, ClockIcon, EditIcon, TrashIcon } from "lucide-react";
// import { Button } from "../ui/button";
// import { ScrollArea } from "../ui/scroll-area";

// export type PlaythroughCardVariant = "default" | "compact";

// interface Props {
//   data: PlaythroughGetManyType;
//   onFinish: (playthroughId: string) => void;
//   variant?: PlaythroughCardVariant;
// }

// export const PlaythroughCard = ({ data, onFinish, variant }: Props) => {
//   const isArchived = data.status === "Archived";
//   const coverImage = data.customCoverImage ?? data.coverImage!;

//   const isCompact = variant === "compact";

//   return (
//     <div
//       className={cn(
//         "relative overflow-hidden bg-background shadow-xl border-2 rounded-2xl",
//         getBorderColor(data.status),
//         isCompact ? "w-full h-40 flex" : "w-87.5 h-110 flex flex-col",
//       )}
//     >
//       {/* ================= HEADER / IMAGE ================= */}
//       <div
//         className={cn("relative", isCompact ? "w-40 h-full" : "h-30 w-full")}
//       >
//         <img
//           src={coverImage}
//           alt={data.name}
//           className="absolute inset-0 h-full w-full object-cover"
//         />
//         {!isCompact && (
//           <div className="absolute inset-0 bg-linear-to-t from-neutral-900 via-neutral-900/70 to-transparent" />
//         )}

//         {!isCompact && (
//           <div className="z-10 px-4 pb-2 absolute bottom-0 w-full">
//             <h2 className="text-xl font-semibold tracking-wide text-white">
//               {data.name}
//             </h2>
//             <p className="mt-1 text-sm text-foreground">
//               {data.platform} | {data.provider} ·{" "}
//               {betterTimeText(data.totalSeconds)}
//             </p>
//           </div>
//         )}
//       </div>

//       {/* ================= BODY ================= */}
//       <div
//         className={cn(
//           "flex flex-col flex-1",
//           isCompact ? "p-4 justify-between" : "px-3 pb-3 pt-3 gap-y-2",
//         )}
//       >
//         {isCompact ? (
//           <>
//             <div>
//               <h2 className="text-lg font-semibold">{data.name}</h2>
//               <p className="text-sm text-muted-foreground">
//                 {betterTimeText(data.totalSeconds)}
//               </p>
//             </div>

//             <Button
//               size="sm"
//               variant="secondary"
//               onClick={() => onFinish(data.id)}
//             >
//               Finish
//             </Button>
//           </>
//         ) : (
//           <>
//             <Button
//               variant="ghost"
//               className="w-full border border-dashed border-muted-foreground/30 hover:border-muted-foreground/80 rounded-lg text-muted-foreground hover:text-foreground bg-transparent hover:bg-background transition"
//             >
//               + New Entry
//             </Button>

//             <ScrollArea className="flex-1">
//               <div className="flex flex-col gap-y-3">
//                 {data.sessions.map((session) => (
//                   <div
//                     key={session.id}
//                     className="flex items-center justify-between rounded-lg border border-card bg-transparent px-3 py-2"
//                   >
//                     <div className="text-sm">
//                       {format(new Date(session.playDate), "PP")}
//                     </div>

//                     <div className="flex items-center gap-2 text-sm">
//                       <ClockIcon className="size-4 pb-0.5" />
//                       {betterTimeText(session.duration)}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </ScrollArea>

//             <div className="flex justify-between items-center p-2 mt-auto border-t-2">
//               <div className="flex items-center gap-x-3 ml-1">
//                 <EditIcon className="size-4" />
//                 <ArchiveIcon className="size-4" />
//                 <TrashIcon className="size-4" />
//               </div>

//               <Button
//                 variant="secondary"
//                 onClick={() => onFinish(data.id)}
//               >
//                 Finish
//               </Button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };
