import { queryOptions } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { playthroughKeys } from "./keys";

import { PlaythroughGetManyType } from "@repo/schemas/types/playthrough";

export const playthroughGetManyQueryOptions = () =>
  queryOptions({
    queryKey: playthroughKeys.getMany(),
    queryFn: async () => {
      const response =
        await api.get<Array<PlaythroughGetManyType>>(`/playthrough/getMany`);

      return response.data;
    },
  });
