'use client';

import type { CommonProps } from '@/lib/types';
import type { LeadRow } from '../types';

import { useEffect } from 'react';
import { useStore } from '../_store';

interface Props extends CommonProps {
  data: LeadRow[];
}

const Provider = ({ data, children }: Props) => {
  const { setData, setInitialLoading } = useStore((state) => state);

  useEffect(() => {
    setData(data);
    setInitialLoading(false);
  }, [data, setData, setInitialLoading]);

  return <>{children}</>;
};

export default Provider;
