import { ComponentType, ReactNode } from "react";

export type LinkType = ComponentType<{
  to: string;
  children: ReactNode;
  className?: string;
}>;
