import { api } from "@repo/utils/lib/api";
import { mutationOptions } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Dispatch, SetStateAction } from "react";

export const authCheckEmailMutationOptions = (
  setError: Dispatch<SetStateAction<string | null>>,
  setPending: Dispatch<SetStateAction<boolean>>,
) =>
  mutationOptions({
    mutationFn: async (email: string) => {
      await api.post("/customAuth/checkEmail", { email });
    },
    onError: (e) => {
      if (isAxiosError(e)) {
        setPending(false);
        setError(e.response?.data.error);
      }
    },
  });
