import type { LeadTag } from '@/app/pipelines/types';
import type { LeadPipeline, LeadRow } from '../types';

import { create } from 'zustand';

export type State = {
  initialLoading: boolean;
  selectedIds: string[];
  data: LeadRow[];
  pipelines: LeadPipeline[];
  tags: LeadTag[];
};

export type Action = {
  setSelectedIds: (ids: string[]) => void;
  setData: (data: LeadRow[]) => void;
  setOptions: (options: Pick<State, 'pipelines' | 'tags'>) => void;
  setInitialLoading: (payload: boolean) => void;
};

const initialState: State = {
  initialLoading: true,
  selectedIds: [],
  data: [],
  pipelines: [],
  tags: [],
};

export const useStore = create<State & Action>((set) => ({
  ...initialState,
  setSelectedIds: (selectedIds) => set(() => ({ selectedIds })),
  setData: (data) => set(() => ({ data })),
  setOptions: (options) => set(() => options),
  setInitialLoading: (initialLoading) => set(() => ({ initialLoading })),
}));
