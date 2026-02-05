import { Skeleton } from "@repo/ui/components/ui/skeleton";

export const CollectionLoading = () => {
  return (
    <div className="group/grid grid grid-cols-[repeat(auto-fill,265px)] gap-6 justify-center mb-4">
      <Skeleton className="w-65 h-97.5 rounded-xl" />
      <Skeleton className="w-65 h-97.5 rounded-xl" />
      <Skeleton className="w-65 h-97.5 rounded-xl" />
      <Skeleton className="w-65 h-97.5 rounded-xl" />
      <Skeleton className="w-65 h-97.5 rounded-xl" />

      <Skeleton className="w-65 h-97.5 rounded-xl" />
      <Skeleton className="w-65 h-97.5 rounded-xl" />
      <Skeleton className="w-65 h-97.5 rounded-xl" />
      <Skeleton className="w-65 h-97.5 rounded-xl" />
      <Skeleton className="w-65 h-97.5 rounded-xl" />

      <Skeleton className="w-65 h-97.5 rounded-xl" />
      <Skeleton className="w-65 h-97.5 rounded-xl" />
      <Skeleton className="w-65 h-97.5 rounded-xl" />
      <Skeleton className="w-65 h-97.5 rounded-xl" />
      <Skeleton className="w-65 h-97.5 rounded-xl" />
    </div>
  );
};
