export function Skeleton({ className = "" }: { readonly className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-default-200/50 ${className}`}
    />
  );
}

export function RouteSkeleton() {
  return (
    <div className="space-y-2.5">
      <Skeleton className="h-4 w-32" />
      <div className="space-y-2">
        <div className="p-3 rounded-xl border border-divider/30">
          <div className="flex justify-between mb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-14" />
          </div>
          <div className="flex gap-1.5">
            <Skeleton className="h-6 w-12 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
          <div className="flex gap-3 mt-2">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="p-3 rounded-xl border border-divider/30">
          <div className="flex justify-between mb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-14" />
          </div>
          <div className="flex gap-1.5">
            <Skeleton className="h-6 w-12 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
          <div className="flex gap-3 mt-2">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>
      </div>
    </div>
  );
}
