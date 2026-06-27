import { Skeleton } from "@/components/ui/skeleton";

export const CollectionLoading = () => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6 w-full">
      {Array.from({ length: 15 }).map((_, i) => (
        <Skeleton
          key={i}
          className="w-full h-97.5 rounded-xl"
        />
      ))}
    </div>
  );
};
