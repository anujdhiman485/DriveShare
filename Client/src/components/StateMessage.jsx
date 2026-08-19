import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/** Full-page centered spinner used while a route loads its data. */
export const PageLoader = ({ label = 'Loading…' }) => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-5 text-center">
    <Spinner className="size-6" />
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

/** Full-page message for "not found" / error routes. */
export const PageMessage = ({ icon: Icon, title, description, children }) => (
  <div className="flex min-h-[60vh] items-center justify-center px-5">
    <Empty>
      <EmptyHeader>
        {Icon && (
          <EmptyMedia variant="icon">
            <Icon />
          </EmptyMedia>
        )}
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {children && <EmptyContent>{children}</EmptyContent>}
    </Empty>
  </div>
);

/** Inline placeholder for empty lists inside a page. */
export const EmptyState = ({ icon: Icon, title, description, children }) => (
  <Empty className="rounded-xl border border-dashed">
    <EmptyHeader>
      {Icon && (
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
      )}
      <EmptyTitle>{title}</EmptyTitle>
      {description && <EmptyDescription>{description}</EmptyDescription>}
    </EmptyHeader>
    {children && <EmptyContent>{children}</EmptyContent>}
  </Empty>
);

/** Shimmer stand-in matching the CarCard footprint. */
export const CarCardSkeleton = () => (
  <Card>
    <Skeleton className="aspect-16/10 w-full rounded-none" />
    <CardHeader>
      <Skeleton className="h-4 w-2/3" />
    </CardHeader>
    <CardContent className="flex flex-col gap-2.5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-3/4" />
    </CardContent>
  </Card>
);
