import type { LeadTag } from '@/app/pipelines/types';
import type { DiffusionPipeline, DiffusionRow, DiffusionTemplate } from '../types';

import { create } from 'zustand';

export type State = {
  initialLoading: boolean;
  data: DiffusionRow[];
  pipelines: DiffusionPipeline[];
  tags: LeadTag[];
  templates: DiffusionTemplate[];
};

export type Action = {
  setData: (data: DiffusionRow[]) => void;
  setOptions: (options: Pick<State, 'pipelines' | 'tags' | 'templates'>) => void;
  setInitialLoading: (payload: boolean) => void;
};

const initialState: State = {
  initialLoading: true,
  data: [],
  pipelines: [],
  tags: [],
  templates: [],
};

export const useStore = create<State & Action>((set) => ({
  ...initialState,
  setData: (data) => set(() => ({ data })),
  setOptions: (options) => set(() => options),
  setInitialLoading: (initialLoading) => set(() => ({ initialLoading })),
}));
