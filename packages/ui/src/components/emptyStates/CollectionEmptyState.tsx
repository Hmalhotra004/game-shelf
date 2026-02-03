import { LinkType } from "@repo/schemas/types/index";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@repo/ui/components/ui/empty";

interface Props {
  Link: LinkType;
}

export const CollectionEmptyState = ({ Link }: Props) => {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyTitle>Your collection is empty</EmptyTitle>
        <EmptyDescription>
          Add a game manually or import from PSN / Steam
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <Link
          to="/import-games"
          className="text-primary font-medium underline underline-offset-4"
        >
          Import Games
        </Link>
      </EmptyContent>
    </Empty>
  );
};
