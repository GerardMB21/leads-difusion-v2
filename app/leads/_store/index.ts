import type { LeadRow } from '../types';

import { create } from 'zustand';

export type State = {
  initialLoading: boolean;
  data: LeadRow[];
};

export type Action = {
  setData: (data: LeadRow[]) => void;
  setInitialLoading: (payload: boolean) => void;
};

const initialState: State = {
  initialLoading: true,
  data: [],
};

export const useStore = create<State & Action>((set) => ({
  ...initialState,
  setData: (data) => set(() => ({ data })),
  setInitialLoading: (initialLoading) => set(() => ({ initialLoading })),
}));
