import { zodResolver } from "@hookform/resolvers/zod";
import { linkSteamAccountSchema } from "@repo/schemas/schemas/user";
import { linkSteamAccountMutationOptions } from "@repo/utils/mutations/user";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

import type z from "zod";

import { FormInput } from "@/components/form/Form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute(
  "/_mainLayout/profile/account-links/steam",
)({
  component: RouteComponent,
});

type FormData = z.infer<typeof linkSteamAccountSchema>;

function RouteComponent() {
  const { steamId, queryClient } = Route.useRouteContext();

  const link = useMutation(linkSteamAccountMutationOptions(api, queryClient));

  const form = useForm<FormData>({
    resolver: zodResolver(linkSteamAccountSchema),
    defaultValues: {
      steamId: steamId ?? "",
    },
  });

  async function onSubmit(values: FormData) {
    await link.mutateAsync(values);
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Link your Steam Account</CardTitle>
          <CardDescription>
            Connect your Steam account to sync your profile and games
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <Button
            size="lg"
            className="w-full"
          >
            Sign in with Steam
          </Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-sm text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-3"
          >
            <p className="text-sm text-muted-foreground">
              Enter your SteamID manually
            </p>

            <FormInput
              name="steamId"
              control={form.control}
              type="number"
              placeholder="76561199092075371"
              disabled={false}
            />

            <Button
              type="submit"
              className="w-full"
            >
              Link Account
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to find your SteamID</CardTitle>
          <CardDescription>
            Follow these simple steps to get your SteamID
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Open your Steam profile</li>
            <li>Click on your username</li>
            <li>Copy the number from the profile URL</li>
          </ol>

          <p className="text-xs">
            Example: https://steamcommunity.com/profiles/
            <span className="font-medium text-foreground">
              76561199092075371
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
