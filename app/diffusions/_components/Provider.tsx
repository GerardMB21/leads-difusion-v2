'use client';

import type { CommonProps } from '@/lib/types';
import type { State } from '../_store';
import type { DiffusionRow } from '../types';

import { useEffect } from 'react';
import { useStore } from '../_store';

interface Props extends CommonProps {
  data: DiffusionRow[];
  options: Pick<State, 'pipelines' | 'tags' | 'templates'>;
}

const Provider = ({ data, options, children }: Props) => {
  const { setData, setOptions, setInitialLoading } = useStore((state) => state);

  useEffect(() => {
    setData(data);
    setOptions(options);
    setInitialLoading(false);
  }, [data, options, setData, setOptions, setInitialLoading]);

  return <>{children}</>;
};

export default Provider;
