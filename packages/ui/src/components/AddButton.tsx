"use client";

import { Button } from "@repo/ui/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Dispatch, SetStateAction, useState, type ReactNode } from "react";

interface AddButtonProps {
  renderContent?: (props: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
  }) => ReactNode;
}

export const AddButton = ({ renderContent }: AddButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {renderContent?.({ open, setOpen })}

      <Button
        variant="secondary"
        size="icon"
        className="fixed bottom-3 right-2 z-10"
        onClick={() => setOpen(true)}
      >
        <PlusIcon />
      </Button>
    </>
  );
};
