'use client';

import type { Lead, Pipeline } from '../types';

import { useDraggable, useDroppable } from '@dnd-kit/react';

import { cn } from '@/lib/utils';
import LeadCard from './LeadCard';

const DraggableLeadCard = ({ lead }: { lead: Lead }) => {
  const { ref, isDragging } = useDraggable({
    id: `lead-${lead.id}`,
    data: { lead },
  });

  return (
    <LeadCard ref={ref} lead={lead} className={cn('cursor-grab', isDragging && 'opacity-40')} />
  );
};

const KanbanColumn = ({ pipeline }: { pipeline: Pipeline }) => {
  const { ref, isDropTarget } = useDroppable({
    id: `pipeline-${pipeline.id}`,
    data: { pipelineId: pipeline.id },
  });

  return (
    <section
      ref={ref}
      className={cn(
        'flex min-h-full w-72 shrink-0 flex-col gap-3 rounded-xl border border-border bg-muted/50 p-3 shadow-md transition-colors',
        isDropTarget && 'bg-muted',
      )}
    >
      <header className="flex items-center justify-between gap-2">
        <h2 className="truncate text-sm font-semibold">{pipeline.name}</h2>
        <span className="text-xs text-muted-foreground">{pipeline.leads.length}</span>
      </header>
      <div className="flex min-h-16 flex-1 flex-col gap-2">
        {pipeline.leads.map((lead) => (
          <DraggableLeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </section>
  );
};

export default KanbanColumn;
