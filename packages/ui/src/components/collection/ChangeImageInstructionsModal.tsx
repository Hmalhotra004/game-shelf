import ResponsiveDialog from "@repo/ui/components/ui/responsive-dialog";
import { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const ChangeImageInstructionsModal = ({ open, setOpen }: Props) => {
  return (
    <ResponsiveDialog
      title="How to change image"
      description="Follow the instructions below"
      open={open}
      onOpenChange={setOpen}
    >
      <div className="gap-y-3 text-sm text-muted-foreground flex flex-col">
        <p>
          You can use custom images from{" "}
          <a
            href="https://www.steamgriddb.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            SteamGridDB
          </a>
          .
        </p>

        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Card Image:</strong> Use an image from the{" "}
            <b>
              <em>Grids</em>
            </b>{" "}
            section.
          </li>
          <li>
            <strong>Hero Image:</strong> Use an image from the{" "}
            <b>
              <em>Heroes</em>
            </b>{" "}
            section.
          </li>
          <li>Open the image and copy the direct image URL.</li>
          <li>Paste the URL here and save your changes.</li>
        </ul>

        <p className="text-xs">
          Only direct image links from{" "}
          <code className="font-semibold">cdn.steamgriddb.com</code> are
          supported.
        </p>

        <Button
          variant="secondary"
          className="ml-auto"
          onClick={() => setOpen(false)}
        >
          OK
        </Button>
      </div>
    </ResponsiveDialog>
  );
};

export default ChangeImageInstructionsModal;
