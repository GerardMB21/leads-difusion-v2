import type { LeadRow } from '../types';

import { create } from 'zustand';

export type State = {
  initialLoading: boolean;
  selectedIds: string[];
  data: LeadRow[];
};

export type Action = {
  setSelectedIds: (ids: string[]) => void;
  setData: (data: LeadRow[]) => void;
  setInitialLoading: (payload: boolean) => void;
};

const initialState: State = {
  initialLoading: true,
  selectedIds: [],
  data: [],
};

export const useStore = create<State & Action>((set) => ({
  ...initialState,
  setSelectedIds: (selectedIds) => set(() => ({ selectedIds })),
  setData: (data) => set(() => ({ data })),
  setInitialLoading: (initialLoading) => set(() => ({ initialLoading })),
}));
