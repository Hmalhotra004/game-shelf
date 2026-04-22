import { Link } from "@tanstack/react-router";
import { ExternalLinkIcon } from "lucide-react";

import type { AccountProfileType } from "@repo/schemas/types/user";
import { unlinkAccountMutationOptions } from "@repo/utils/mutations/user";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { UnlinkAccountSchemaType } from "@repo/schemas/schemas/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Platform = "steam" | "playstation";

interface Props {
  title: string;
  platform: Platform;
  isConnected: boolean;
  isLoading: boolean;
  data: AccountProfileType | null;
}

const map: Record<Platform, UnlinkAccountSchemaType["type"]> = {
  playstation: "PSN",
  steam: "Steam",
} as const;

const AccountCard = ({
  title,
  platform,
  data,
  isConnected,
  isLoading,
}: Props) => {
  const queryClient = useQueryClient();

  const { mutateAsync: update, isPending } = useMutation(
    unlinkAccountMutationOptions(api, queryClient),
  );

  if (isLoading) {
    return (
      <div className="flex flex-col p-4 rounded-lg border-border border justify-center items-center">
        <p className="text-sm text-muted-foreground">
          Loading {title} profile…
        </p>
      </div>
    );
  }

  if (!isConnected || !data) {
    return (
      <div className="flex flex-col p-4 rounded-lg border-border border gap-1.5">
        <h1 className="leading-none font-semibold text-xl">{title}</h1>

        <h3 className="text-sm text-muted-foreground">
          Go to platform page to link an account.
        </h3>

        <Link to={`/profile/account-links/${platform}`}>
          <Button
            variant="outline"
            className="mr-auto mt-1"
          >
            Go to Page
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 rounded-lg border-border border gap-1.5">
      <h1 className="leading-none font-semibold text-xl">{title}</h1>

      <Separator className="my-0.5" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {data?.avatar && (
            <div className="relative size-16 overflow-hidden border rounded-full">
              <img
                src={data.avatar}
                alt={data.username}
                className="object-cover"
              />
            </div>
          )}

          <div className="flex flex-col">
            <span className="font-semibold text-lg">{data.username}</span>

            {data.realName && (
              <span className="text-sm text-muted-foreground">
                {data.realName}
              </span>
            )}

            {data.profileUrl && (
              <a
                href={data.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View profile
                <ExternalLinkIcon className="size-4" />
              </a>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          disabled={isPending}
          onClick={() => update({ type: map[platform] })}
        >
          Unlink
        </Button>
      </div>
    </div>
  );
};

export default AccountCard;
