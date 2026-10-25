import type { Pipeline } from '../types';

import { create } from 'zustand';

export type State = {
  initialLoading: boolean;
  data: Pipeline[];
};

export type Action = {
  setData: (data: Pipeline[]) => void;
  setInitialLoading: (payload: boolean) => void;
  moveLead: (leadId: number, toPipelineId: number) => void;
};

const initialState: State = {
  initialLoading: true,
  data: [],
};

export const useStore = create<State & Action>((set) => ({
  ...initialState,
  setData: (data) => set(() => ({ data })),
  setInitialLoading: (initialLoading) => set(() => ({ initialLoading })),
  moveLead: (leadId, toPipelineId) =>
    set(({ data }) => {
      const lead = data.flatMap((pipeline) => pipeline.leads).find(({ id }) => id === leadId);

      if (!lead || lead.pipelineId === toPipelineId) return {};

      const moved = { ...lead, pipelineId: toPipelineId };

      return {
        data: data.map((pipeline) => {
          const leads = pipeline.leads.filter(({ id }) => id !== leadId);

          return pipeline.id === toPipelineId
            ? { ...pipeline, leads: [...leads, moved] }
            : { ...pipeline, leads };
        }),
      };
    }),
}));
