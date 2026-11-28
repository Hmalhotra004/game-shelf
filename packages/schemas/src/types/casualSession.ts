import { CasualSessionListQuerySchemaType } from "@repo/schemas/schemas/casualSession";

export type CasualSessionGetManyFilters = Omit<
  CasualSessionListQuerySchemaType,
  "page" | "limit"
> & { limit?: number };

export type CasualSessionGetManyItem = {
  id: string;
  playDate: string;
  secondsPlayed: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CasualSessionGetManyResponse = {
  items: CasualSessionGetManyItem[];
  total: number;
  totalPages: number;
  totalSeconds: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  nextPage: number | null;
};
