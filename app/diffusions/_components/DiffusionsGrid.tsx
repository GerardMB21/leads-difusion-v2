'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useStore } from '../_store';
import DiffusionCard from './DiffusionCard';

const DiffusionsGrid = () => {
  const { data, initialLoading } = useStore((state) => state);

  if (initialLoading) return <Skeleton className="h-96 w-full rounded-lg" />;

  if (!data.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No hay diffusions.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.map((diffusion) => (
        <DiffusionCard key={diffusion.id} diffusion={diffusion} />
      ))}
    </div>
  );
};

export default DiffusionsGrid;
