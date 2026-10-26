'use client';

import type { CommonProps } from '@/lib/types';
import type { PipelineOption } from '../schemas';
import type { WorkflowRow } from '../types';

import { useEffect } from 'react';
import { useStore } from '../_store';

interface Props extends CommonProps {
  data: WorkflowRow[];
  pipelines: PipelineOption[];
}

const Provider = ({ data, pipelines, children }: Props) => {
  const { setData, setPipelines, setInitialLoading } = useStore((state) => state);

  useEffect(() => {
    setData(data);
    setPipelines(pipelines);
    setInitialLoading(false);
  }, [data, pipelines, setData, setPipelines, setInitialLoading]);

  return <>{children}</>;
};

export default Provider;
