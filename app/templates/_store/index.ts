import type { Template } from '../types';

import { create } from 'zustand';

export type State = {
  initialLoading: boolean;
  data: Template[];
  search: string;
};

export type Action = {
  setData: (data: Template[]) => void;
  setInitialLoading: (payload: boolean) => void;
  setSearch: (search: string) => void;
};

const initialState: State = {
  initialLoading: true,
  data: [],
  search: '',
};

export const useStore = create<State & Action>((set) => ({
  ...initialState,
  setData: (data) => set(() => ({ data })),
  setInitialLoading: (initialLoading) => set(() => ({ initialLoading })),
  setSearch: (search) => set(() => ({ search })),
}));
