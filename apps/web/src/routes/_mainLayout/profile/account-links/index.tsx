import { getPSNProfileQueryOptions } from "@repo/utils/queries/psn";
import { getSteamProfileQueryOptions } from "@repo/utils/queries/steam";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { MoveLeftIcon } from "lucide-react";

import AccountCard from "@/components/accountLinks/AccountCard";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/_mainLayout/profile/account-links/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { steamId, PSNAccountId } = Route.useRouteContext();
  const router = useRouter();

  const {
    data: steam,
    isLoading: isLoadingSteam,
    isError: isErrorSteam,
    error: steamError,
  } = useQuery(getSteamProfileQueryOptions(api, !!steamId));

  const {
    data: psn,
    isLoading: isLoadingPSN,
    isError: isErrorPSN,
    error: psnError,
  } = useQuery(getPSNProfileQueryOptions(api, false));

  if (isErrorSteam) {
    if (isAxiosError(steamError)) {
      console.error(steamError?.response?.data?.error);
    }
  }

  if (isErrorPSN) {
    if (isAxiosError(psnError)) {
      console.error(psnError?.response?.data?.error);
    }
  }

  return (
    <Card className="mx-auto w-full">
      <CardHeader className="flex items-center gap-4">
        <div className="flex flex-col gap-y-0.5 w-full">
          <div className="flex justify-between items-center w-full">
            <CardTitle className="text-2xl">Account Links</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.history.back()}
            >
              <MoveLeftIcon className="size-4" />
              Back
            </Button>
          </div>

          <CardDescription>
            For GameShelf to be able to automatically sync your data from the
            platforms you play on, you will need to link your accounts for each
            of them.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 justify-between gap-6">
          <AccountCard
            title="Playstation"
            platform="playstation"
            isConnected={!!PSNAccountId}
            isLoading={isLoadingPSN}
            data={psn}
          />

          <AccountCard
            title="Steam"
            platform="steam"
            isConnected={!!steamId}
            isLoading={isLoadingSteam}
            data={steam}
          />
        </div>
      </CardContent>
    </Card>
  );
}
