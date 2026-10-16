import { CompletionListQuerySchemaType } from "@repo/schemas/schemas/completion";

export type CompletionGetMany = {
  id: string;
};

export type CompletionGetManyResponse = {
  items: CompletionGetMany[];
  total: number;
  totalSeconds: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  nextPage: number | null;
};

export type CompletionGetManyFilters = Omit<
  CompletionListQuerySchemaType,
  "page" | "limit"
> & { limit?: number };
