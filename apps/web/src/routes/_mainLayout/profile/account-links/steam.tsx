import { zodResolver } from "@hookform/resolvers/zod";
import { linkSteamAccountSchema } from "@repo/schemas/schemas/user";
import { linkSteamAccountMutationOptions } from "@repo/utils/mutations/user";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute(
  "/_mainLayout/profile/account-links/steam",
)({
  beforeLoad: ({ context }) => {
    if (context.steamId !== null) {
      throw redirect({
        to: "/profile/account-links",
      });
    }
  },
  component: RouteComponent,
});

type FormData = z.infer<typeof linkSteamAccountSchema>;

function RouteComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  const link = useMutation(linkSteamAccountMutationOptions(api, queryClient));

  const form = useForm<FormData>({
    resolver: zodResolver(linkSteamAccountSchema),
    defaultValues: {
      steamId: "",
    },
  });

  async function onSubmit(values: FormData) {
    await link.mutateAsync(values);
    router.history.back();
  }

  const isPending = link.isPending;

  // TODO:make responsive
  // TODO:better how to get steamID
  // TODO:Sign in via steam

  return (
    <div className="flex mx-auto gap-16 max-w-5xl">
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
            disabled={isPending}
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
              placeholder="76561199092075371"
              disabled={isPending}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
            >
              Link Account
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t pt-4">
          <CardTitle className="text-base font-semibold">
            Things to know
          </CardTitle>

          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>
              Set your Steam profile privacy to{" "}
              <span className="font-medium text-foreground">Public</span>.
            </li>
            <li>
              Your{" "}
              <span className="font-medium text-foreground">
                13-digit SteamID
              </span>{" "}
              is not your username.
            </li>
          </ul>
        </CardFooter>
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
