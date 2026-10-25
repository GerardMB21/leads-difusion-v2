'use client';

import type { Lead } from '../types';

import { DragDropProvider, DragOverlay } from '@dnd-kit/react';

import { Skeleton } from '@/components/ui/skeleton';
import { useStore } from '../_store';
import KanbanColumn from './KanbanColumn';
import LeadCard from './LeadCard';

const Kanban = () => {
  const { data, initialLoading, moveLead } = useStore((state) => state);

  if (initialLoading) {
    return (
      <div className="flex gap-4 p-4">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} className="h-96 w-72 shrink-0 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <DragDropProvider
      onDragEnd={({ canceled, operation: { source, target } }) => {
        if (canceled || !source || !target) return;

        moveLead(source.data.lead.id, target.data.pipelineId);
      }}
    >
      <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto p-4">
        {data.map((pipeline) => (
          <KanbanColumn key={pipeline.id} pipeline={pipeline} />
        ))}
      </div>
      <DragOverlay>
        {(source) => (
          <LeadCard lead={source.data.lead as Lead} className="cursor-grabbing shadow-lg" />
        )}
      </DragOverlay>
    </DragDropProvider>
  );
};

export default Kanban;
