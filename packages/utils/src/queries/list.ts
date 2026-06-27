import { ListType } from "@repo/schemas/types/list";
import { queryOptions } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

export const ListQueryKeys = {
  all: ["Lists"] as const,

  getMany: () => [...ListQueryKeys.all] as const,
};

export const listGetManyQueryOptions = (api: AxiosInstance) =>
  queryOptions({
    queryKey: ListQueryKeys.getMany(),
    queryFn: async () => {
      const response = await api.get<Array<ListType>>(`/list/getMany`);

      return response.data;
    },
  });
