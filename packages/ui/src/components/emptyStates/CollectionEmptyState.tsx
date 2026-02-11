import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@repo/ui/components/ui/empty";

interface Props {
  renderLink?: (children: React.ReactNode) => React.ReactNode;
}

export const CollectionEmptyState = ({ renderLink }: Props) => {
  const importLink = (
    <span className="text-primary font-medium underline underline-offset-4 cursor-pointer">
      Import Games
    </span>
  );

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyTitle>Your collection is empty</EmptyTitle>
        <EmptyDescription>
          Add a game manually or import from PSN / Steam
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        {renderLink ? renderLink(importLink) : importLink}
      </EmptyContent>
    </Empty>
  );
};
