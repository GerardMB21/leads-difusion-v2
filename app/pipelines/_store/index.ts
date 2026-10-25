import type { Pipeline } from '../types';

import { create } from 'zustand';

export const pipelineKey = (id: number) => `pipeline-${id}`;
export const leadKey = (id: number) => `lead-${id}`;

export type State = {
  initialLoading: boolean;
  data: Pipeline[];
};

export type Action = {
  setData: (data: Pipeline[]) => void;
  setInitialLoading: (payload: boolean) => void;
  setPipelineLayout: (keys: string[]) => void;
  setLeadLayout: (layout: Record<string, string[]>) => void;
};

const initialState: State = {
  initialLoading: true,
  data: [],
};

export const useStore = create<State & Action>((set) => ({
  ...initialState,
  setData: (data) => set(() => ({ data })),
  setInitialLoading: (initialLoading) => set(() => ({ initialLoading })),
  setPipelineLayout: (keys) =>
    set(({ data }) => {
      const byKey = new Map(data.map((pipeline) => [pipelineKey(pipeline.id), pipeline]));

      return {
        data: keys.flatMap((key) => byKey.get(key) ?? []),
      };
    }),
  setLeadLayout: (layout) =>
    set(({ data }) => {
      const byKey = new Map(
        data.flatMap((pipeline) => pipeline.leads).map((lead) => [leadKey(lead.id), lead]),
      );

      return {
        data: data.map((pipeline) => ({
          ...pipeline,
          leads: (layout[pipelineKey(pipeline.id)] ?? []).flatMap((key) => {
            const lead = byKey.get(key);

            return lead ? { ...lead, pipelineId: pipeline.id } : [];
          }),
        })),
      };
    }),
}));
