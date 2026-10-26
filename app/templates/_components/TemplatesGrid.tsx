'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useStore } from '../_store';
import TemplateCard from './TemplateCard';

const TemplatesGrid = () => {
  const { data, search, initialLoading } = useStore((state) => state);

  if (initialLoading) return <Skeleton className="h-96 w-full rounded-lg" />;

  const query = search.trim().toLowerCase();
  const templates = query ? data.filter(({ name }) => name.toLowerCase().includes(query)) : data;

  if (!templates.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No hay templates.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
};

export default TemplatesGrid;
