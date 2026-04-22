import { createFileRoute, useRouter } from "@tanstack/react-router";
import { MoveLeftIcon } from "lucide-react";

import AccountCard from "@/components/accountLinks/AccountCard";
import { Button } from "@/components/ui/button";

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
  const router = useRouter();

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
          />

          <AccountCard
            title="Steam"
            platform="steam"
          />
        </div>
      </CardContent>
    </Card>
  );
}
