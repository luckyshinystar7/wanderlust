import { Skeleton } from '@/components/ui/skeleton';

export const FeaturedPostCardSkeleton = () => {
  return (
    <div className="flex rounded-lg bg-light dark:bg-dark-card">
      {/* for image */}
      <div className="w-1/3">
        <Skeleton className="h-full w-full rounded-lg bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="flex h-48 w-2/3 gap-4 rounded-lg p-3">
        <div className="flex w-full flex-col gap-3">
          {/* for title */}
          <Skeleton className="h-6 w-11/12 bg-slate-200 dark:bg-slate-700" />
          <Skeleton className="h-6 w-2/3 bg-slate-200 dark:bg-slate-700" />
          <div className="flex flex-wrap gap-2">
            {/* for categories */}
            {Array(3)
              .fill(0)
              .map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-700"
                />
              ))}
          </div>
          {/* for description */}
          <Skeleton className="line-clamp-2 h-12 w-10/12 bg-slate-200 dark:bg-slate-700" />
          <div className="mb-1 flex flex-1 items-end">
            {/* for author and time */}
            <Skeleton className="h-3 w-1/3 bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
};
