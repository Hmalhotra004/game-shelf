"use client";

import type { LinkType } from "@repo/schemas/types/index";
import { authClient } from "@repo/ui/lib/authClient";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Spinner } from "./ui/spinner";

import {
  ImportIcon,
  KeyRoundIcon,
  ListIcon,
  LogOutIcon,
  SettingsIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Props {
  Link: LinkType;
  onLogout: () => void;
}

const UserButton = ({ Link, onLogout }: Props) => {
  const { data, isPending } = authClient.useSession();

  const user = data?.user;

  if (isPending) {
    return (
      <div className="size-10 rounded-full flex items-center justify-around bg-background border border-border">
        <Spinner className="size-4 text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  const avatarFallback = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email.charAt(0).toUpperCase();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-none relative">
        {user.image ? (
          <div className="size-10 relative rounded-full overflow-hidden cursor-pointer hover:opacity-75">
            <img
              src={user.image}
              alt="User"
              className="object-cover"
            />
          </div>
        ) : (
          <Avatar className="size-10 hover:opacity-75 transition border border-border cursor-pointer">
            <AvatarFallback className="bg-card font-medium text-foreground flex items-center justify-center">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="bottom"
        className="w-60"
        sideOffset={10}
      >
        <div className="flex flex-col items-center justify-center gap-2 px-2.5 py-4">
          {user.image ? (
            <div className="size-13 relative rounded-full overflow-hidden cursor-pointer hover:opacity-75">
              <img
                src={user.image}
                alt="User"
                className="object-cover"
              />
            </div>
          ) : (
            <Avatar className="size-13 hover:opacity-75 transition border border-border cursor-pointer">
              <AvatarFallback className="bg-card font-medium text-foreground flex items-center justify-center">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          )}

          <div className="flex flex-col items-center justify-center gap-y-1">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-foreground">{user.email}</p>
          </div>
        </div>

        <Separator className="my-1" />

        <DropdownMenuItem
          className="h-10 flex items-center justify-center font-medium cursor-pointer transition"
          asChild
        >
          <Link to="/lists">
            <ListIcon className="size-4 mr-1" />
            Manage Lists
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="h-10 flex items-center justify-center font-medium cursor-pointer transition"
          asChild
        >
          <Link to="/platinum-list">
            <ListIcon className="size-4 mr-1" />
            Platinum List
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="h-10 flex items-center justify-center font-medium cursor-pointer transition"
          asChild
        >
          <Link to="/mastered-games">
            <ListIcon className="size-4 mr-1" />
            Mastered Games
          </Link>
        </DropdownMenuItem>

        <Separator className="my-1" />

        <DropdownMenuItem
          className="h-10 flex items-center justify-center font-medium cursor-pointer transition"
          asChild
        >
          <Link to="/profile/connections">
            <KeyRoundIcon className="size-4 mr-1" />
            Connections
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="h-10 flex items-center justify-center font-medium cursor-pointer transition"
          asChild
        >
          <Link to="/import-games">
            <ImportIcon className="size-4 mr-1" />
            Import Games
          </Link>
        </DropdownMenuItem>

        <Separator className="my-1" />

        {/* FIXME:do it ater */}
        {/* {!isLoading && isAdmin && (
          <DropdownMenuItem
            className="h-10 flex items-center justify-center font-medium cursor-pointer transition"
            asChild
          >
            <Link to="/backup">
              <DownloadCloudIcon className="size-4 mr-1" />
              Backup Data
            </Link>
          </DropdownMenuItem>
        )} */}

        <DropdownMenuItem
          className="h-10 flex items-center justify-center font-medium cursor-pointer transition"
          asChild
        >
          <Link to="/profile/settings">
            <SettingsIcon className="size-4 mr-1" />
            Settings
          </Link>
        </DropdownMenuItem>

        <Separator className="my-1" />

        <DropdownMenuItem
          onClick={onLogout}
          className="h-10 flex items-center justify-center text-amber-700 font-medium cursor-pointer transition"
        >
          <LogOutIcon className="size-4 mr-1" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
