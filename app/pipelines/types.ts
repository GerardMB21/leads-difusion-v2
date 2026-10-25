import type { BaseFilters, BaseModel } from '@/lib/types';

export type LeadTag = {
  id: number;
  name: string;
};

export type Lead = {
  contactName: string;
  phone: string;
  order: number;
  enrollmentDate: string;
  pipelineId: number;
  tags: LeadTag[];
} & BaseModel;

export type Pipeline = {
  name: string;
  order: number;
  default: boolean;
  leads: Lead[];
} & BaseModel;

export type PipelineFilters = {
  name?: string;
  order?: number;
  default?: boolean;
} & BaseFilters;
