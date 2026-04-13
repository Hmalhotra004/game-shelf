import { Link } from "@tanstack/react-router";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export const CollectionEmptyState = () => {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyTitle>Your collection is empty</EmptyTitle>
        <EmptyDescription>
          Add a game manually or import from 3rd Party Services
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <Link to={`/profile/connections`}>
          <span className="text-primary font-medium underline underline-offset-4 cursor-pointer">
            Import Games
          </span>
        </Link>
      </EmptyContent>
    </Empty>
  );
};
