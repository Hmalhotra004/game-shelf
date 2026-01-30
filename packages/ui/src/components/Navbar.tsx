"use client";
import { LinkType } from "@repo/schemas/types/index";
import { cn } from "@repo/ui/lib/utils";
import { Gamepad2Icon, HomeIcon, LibraryIcon, TrophyIcon } from "lucide-react";
import { Button } from "./ui/button";
import UserButton from "./UserButton";

interface Props {
  Link: LinkType;
  onLogout: () => void;
  pathname: string;
}

const Navbar = ({ Link, onLogout, pathname }: Props) => {
  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: HomeIcon,
    },
    {
      label: "Collection",
      href: "/collection",
      icon: LibraryIcon,
    },
    {
      label: "Playthroughs",
      href: "/playthroughs",
      icon: Gamepad2Icon,
    },
    {
      label: "Completions",
      href: "/completions",
      icon: TrophyIcon,
    },
  ];

  return (
    <nav className="border-b border-border bg-card sticky top-0 z-50">
      <div className="mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Gamepad2Icon className="w-8 h-8 text-foreground" />
            <h1 className="text-xl font-bold text-foreground">GameShelf</h1>
          </div>

          <div className="flex gap-1">
            {navItems.map((item, idx) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Button
                  key={idx}
                  variant="ghost"
                  size="lg"
                  className={cn(
                    "text-base text-muted-foreground",
                    isActive && "text-foreground",
                  )}
                  asChild
                >
                  <Link to={item.href}>
                    <item.icon className="size-4" />
                    <span className="hidden sm:inline">{item.label} </span>
                  </Link>
                </Button>
              );
            })}
          </div>

          <UserButton
            Link={Link}
            onLogout={onLogout}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
