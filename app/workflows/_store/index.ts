import type { PipelineOption } from '../schemas';
import type { WorkflowRow } from '../types';

import { create } from 'zustand';

export type State = {
  initialLoading: boolean;
  selectedIds: string[];
  data: WorkflowRow[];
  pipelines: PipelineOption[];
};

export type Action = {
  setSelectedIds: (ids: string[]) => void;
  setData: (data: WorkflowRow[]) => void;
  setPipelines: (pipelines: PipelineOption[]) => void;
  setInitialLoading: (payload: boolean) => void;
};

const initialState: State = {
  initialLoading: true,
  selectedIds: [],
  data: [],
  pipelines: [],
};

export const useStore = create<State & Action>((set) => ({
  ...initialState,
  setSelectedIds: (selectedIds) => set(() => ({ selectedIds })),
  setData: (data) => set(() => ({ data })),
  setPipelines: (pipelines) => set(() => ({ pipelines })),
  setInitialLoading: (initialLoading) => set(() => ({ initialLoading })),
}));
