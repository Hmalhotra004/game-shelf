import { queryOptions } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { ListQueryKeys } from "./list.keys";

import { ListType } from "@repo/schemas/types/list";

export const listGetManyQueryOptions = () =>
  queryOptions({
    queryKey: ListQueryKeys.getMany(),
    queryFn: async () => {
      const response = await api.get<Array<ListType>>(`/list/getMany`);

      return response.data;
    },
  });
