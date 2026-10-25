'use client';

import type { Lead, Pipeline } from '../types';

import { useRef, useState } from 'react';
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { move } from '@dnd-kit/helpers';

import { Skeleton } from '@/components/ui/skeleton';
import { api, getApiErrorMessage } from '@/lib/api';
import { leadKey, pipelineKey, useStore } from '../_store';
import KanbanColumn from './KanbanColumn';
import LeadCard from './LeadCard';

const REORDER_TIMEOUT = 10_000;

const toReorderPayload = (before: Pipeline[], after: Pipeline[]) => {
  const previous = new Map(
    before.flatMap((pipeline) =>
      pipeline.leads.map((lead, order) => [lead.id, { order, pipelineId: pipeline.id }] as const),
    ),
  );
  const previousOrder = new Map(before.map((pipeline, order) => [pipeline.id, order]));

  return {
    pipelines: after
      .map(({ id }, order) => ({ id, order }))
      .filter(({ id, order }) => previousOrder.get(id) !== order),
    leads: after.flatMap((pipeline) =>
      pipeline.leads.flatMap((lead, order) => {
        const old = previous.get(lead.id);

        if (old?.order === order && old.pipelineId === pipeline.id) return [];

        return {
          id: lead.id,
          order,
          pipelineId: pipeline.id,
          ...(old && old.pipelineId !== pipeline.id && { beforePipelineId: old.pipelineId }),
        };
      }),
    ),
  };
};

const Kanban = () => {
  const { data, initialLoading, setData, setPipelineLayout, setLeadLayout } = useStore(
    (state) => state,
  );
  const snapshot = useRef<Pipeline[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (initialLoading) {
    return (
      <div className="flex gap-4 p-4">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} className="h-96 w-72 shrink-0 rounded-xl" />
        ))}
      </div>
    );
  }

  const persist = async () => {
    const payload = toReorderPayload(snapshot.current, useStore.getState().data);

    if (payload.pipelines.length === 0 && payload.leads.length === 0) return;

    try {
      await api.put('/pipelines/order', payload, { timeout: REORDER_TIMEOUT });
    } catch (e) {
      setData(snapshot.current);
      setError(getApiErrorMessage(e, 'No se pudo guardar el orden'));
    }
  };

  return (
    <DragDropProvider
      onDragStart={() => {
        snapshot.current = useStore.getState().data;
        setError(null);
      }}
      onDragOver={(event) => {
        const { source } = event.operation;

        if (!source) return;

        if (source.type === 'column') {
          setPipelineLayout(
            move(
              data.map(({ id }) => ({ id: pipelineKey(id) })),
              event,
            ).map(({ id }) => String(id)),
          );

          return;
        }

        const layout = move(
          Object.fromEntries(
            data.map((pipeline) => [
              pipelineKey(pipeline.id),
              pipeline.leads.map(({ id }) => ({ id: leadKey(id) })),
            ]),
          ),
          event,
        );

        setLeadLayout(
          Object.fromEntries(
            Object.entries(layout).map(([key, items]) => [key, items.map(({ id }) => String(id))]),
          ),
        );
      }}
      onDragEnd={(event) => {
        if (event.canceled) {
          setData(snapshot.current);

          return;
        }

        void persist();
      }}
    >
      {error && (
        <p role="alert" className="px-4 pt-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto p-4">
        {data.map((pipeline, index) => (
          <KanbanColumn key={pipeline.id} pipeline={pipeline} index={index} />
        ))}
      </div>
      <DragOverlay>
        {(source) =>
          source.type === 'column' ? (
            <div className="w-72 cursor-grabbing rounded-xl border bg-muted p-3 text-sm font-semibold shadow-lg">
              {(source.data.pipeline as Pipeline).name}
            </div>
          ) : (
            <LeadCard lead={source.data.lead as Lead} className="cursor-grabbing shadow-lg" />
          )
        }
      </DragOverlay>
    </DragDropProvider>
  );
};

export default Kanban;
