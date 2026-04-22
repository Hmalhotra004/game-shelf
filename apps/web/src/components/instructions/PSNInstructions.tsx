import { InfoIcon } from "lucide-react";

const PSNInstructions = () => {
  return (
    <div className="text-sm text-muted-foreground space-y-1">
      <p className="flex items-center gap-1">
        <InfoIcon className="h-4 w-4" />
        Required to sync PlayStation trophies and games.
      </p>

      <ul className="list-disc list-inside ml-5 space-y-0.5">
        <li>Add your PSN Account Username</li>
      </ul>

      <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground mt-1.5">
        <b>Note:</b> Username should be accurate to sync games
      </div>
    </div>
  );
};

export default PSNInstructions;
