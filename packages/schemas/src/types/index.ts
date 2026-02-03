import { ComponentType, ReactNode } from "react";

// export type PlaythroughStatusType = z.infer<typeof playthroughStatusSchema>;
// export type GameType = z.infer<typeof GameTypeSchema>;
// export type CompletionStyleType = z.infer<typeof completionStyleSchema>;
// export type UserAccountType = z.infer<typeof UserAccountSchema>;
// export type SyncType = z.infer<typeof SyncTypeSchema>;

export type LinkType = ComponentType<{
  to: string;
  children: ReactNode;
  className?: string;
}>;

export type DataType = { label: string; value: number };
