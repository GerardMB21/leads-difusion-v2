'use client';

import type { Lead, Pipeline } from '../types';

import { useSortable } from '@dnd-kit/react/sortable';

import { cn } from '@/lib/utils';
import { leadKey, pipelineKey } from '../_store';
import LeadCard from './LeadCard';
import PipelineActions from './PipelineActions';

const SortableLeadCard = ({ lead, index }: { lead: Lead; index: number }) => {
  const { ref, isDragging } = useSortable({
    id: leadKey(lead.id),
    index,
    group: pipelineKey(lead.pipelineId),
    type: 'item',
    accept: 'item',
    data: { lead },
  });

  return (
    <LeadCard ref={ref} lead={lead} className={cn('cursor-grab', isDragging && 'opacity-40')} />
  );
};

const KanbanColumn = ({ pipeline, index }: { pipeline: Pipeline; index: number }) => {
  const { ref, handleRef, isDragging } = useSortable({
    id: pipelineKey(pipeline.id),
    index,
    type: 'column',
    accept: ['column', 'item'],
    data: { pipeline },
  });

  return (
    <section
      ref={ref}
      className={cn(
        'flex h-full w-72 shrink-0 flex-col gap-3 overflow-y-auto rounded-xl border border-border bg-muted/50 p-3 shadow-md transition-colors',
        isDragging && 'opacity-40',
      )}
    >
      <header className="flex items-center justify-between gap-2">
        <h2 ref={handleRef} className="min-w-0 flex-1 cursor-grab truncate text-sm font-semibold">
          {pipeline.name}
        </h2>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">{pipeline.leads.length}</span>
          <PipelineActions pipeline={pipeline} />
        </div>
      </header>
      <div className="mb-3 flex min-h-16 flex-1 flex-col gap-2">
        {pipeline.leads.map((lead, leadIndex) => (
          <SortableLeadCard key={lead.id} lead={lead} index={leadIndex} />
        ))}
      </div>
    </section>
  );
};

export default KanbanColumn;
