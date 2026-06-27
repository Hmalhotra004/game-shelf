import { ImageIcon } from "lucide-react";

export const ChangeImagesEmptyState = () => {
  return (
    <div className="flex items-center justify-center h-135">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-10 py-12 text-center shadow-sm">
        <div className="rounded-full bg-muted p-4">
          <ImageIcon className="size-6 text-muted-foreground" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-semibold">No images found</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            We couldn&apos;t find any images matching your filters.
          </p>
        </div>
      </div>
    </div>
  );
};
