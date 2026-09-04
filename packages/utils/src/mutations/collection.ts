import { mutationOptions } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

export const addCollectionMutationOptions = (api: AxiosInstance) =>
  mutationOptions({
    mutationFn: async (data:any) => {
      await api.post("/collection/add", data);
    },
  });
