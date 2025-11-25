import { cn } from '@/lib/utils/cn';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse bg-muted rounded-md',
        className
      )}
      {...props}
    />
  );
}

function SkeletonText({ className, lines = 1, ...props }: React.HTMLAttributes<HTMLDivElement> & { lines?: number }) {
  if (lines === 1) {
    return <Skeleton className={cn('h-4 w-full', className)} {...props} />;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full', className)}
          {...props}
        />
      ))}
    </div>
  );
}

function SkeletonCircle({ className, size = 'h-10 w-10', ...props }: React.HTMLAttributes<HTMLDivElement> & { size?: string }) {
  return <Skeleton className={cn('rounded-full', size, className)} {...props} />;
}

function SkeletonRectangle({ className, width = 'w-full', height = 'h-20', ...props }: React.HTMLAttributes<HTMLDivElement> & { width?: string; height?: string }) {
  return <Skeleton className={cn(width, height, className)} {...props} />;
}

export { Skeleton, SkeletonText, SkeletonCircle, SkeletonRectangle };

