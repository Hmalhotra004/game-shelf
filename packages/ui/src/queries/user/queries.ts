import { queryOptions } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { keys } from "./keys";

import { GetGamesType } from "@repo/schemas/types/user";

export const getGamesQueryOptions = () =>
  queryOptions({
    queryKey: keys.getGames(),
    queryFn: async () => {
      const response = await api.get<GetGamesType>(`/user/getGames`);

      return response.data;
    },
  });
