import { BaseFilters, BaseModel } from '@/lib/types';

export type Pipeline = {
  name: string;
  order: number;
  default: boolean;
} & BaseModel;

export type PipelineFilters = {
  name?: string;
  order?: number;
  default?: boolean;
} & BaseFilters;
