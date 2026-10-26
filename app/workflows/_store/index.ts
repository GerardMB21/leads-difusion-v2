import type { PipelineOption } from '../schemas';
import type { WorkflowRow } from '../types';

import { create } from 'zustand';

export type State = {
  initialLoading: boolean;
  data: WorkflowRow[];
  pipelines: PipelineOption[];
};

export type Action = {
  setData: (data: WorkflowRow[]) => void;
  setPipelines: (pipelines: PipelineOption[]) => void;
  setInitialLoading: (payload: boolean) => void;
};

const initialState: State = {
  initialLoading: true,
  data: [],
  pipelines: [],
};

export const useStore = create<State & Action>((set) => ({
  ...initialState,
  setData: (data) => set(() => ({ data })),
  setPipelines: (pipelines) => set(() => ({ pipelines })),
  setInitialLoading: (initialLoading) => set(() => ({ initialLoading })),
}));
