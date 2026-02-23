import { queryOptions } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { keys } from "./keys";

import { PlaythroughGetManyType } from "@repo/schemas/types/playthrough";

export const playthroughGetManyQueryOptions = () =>
  queryOptions({
    queryKey: keys.getMany(),
    queryFn: async () => {
      const response =
        await api.get<Array<PlaythroughGetManyType>>(`/playthrough/getMany`);

      return response.data;
    },
  });
