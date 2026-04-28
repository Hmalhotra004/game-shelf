import { PlusIcon } from "lucide-react";
import { useState } from "react";

import type { Dispatch, ReactNode, SetStateAction } from "react";

import { Button } from "@/components/ui/button";

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
