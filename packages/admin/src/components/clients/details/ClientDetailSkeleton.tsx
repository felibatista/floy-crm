import { Skeleton } from "@/components/ui/skeleton";

const ClientDetailsSkeleton = () => {
  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
};

export default ClientDetailsSkeleton;
