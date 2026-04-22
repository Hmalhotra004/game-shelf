import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

interface Props {
  title: string;
  platform: "playstation" | "steam";
  data?: { image: string | null; userName: string };
}

const AccountCard = ({ title, platform, data }: Props) => {
  return (
    <div className="flex flex-col p-4 rounded-lg border-border border gap-1.5">
      <h1 className="leading-none font-semibold text-xl">{title}</h1>

      <h3 className="text-sm text-muted-foreground">
        Go to platform page to link an account.
      </h3>

      {data === undefined ? (
        <Link to={`/profile/account-links/${platform}`}>
          <Button
            variant="outline"
            className="mr-auto mt-1"
          >
            Go to Page
          </Button>
        </Link>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default AccountCard;
