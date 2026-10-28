import type { BaseModel } from '@/lib/types';
import type { LeadTag } from '@/app/pipelines/types';

export type Lead = {
  contactName: string;
  phone: string;
  order: number;
  enrollmentDate: string;
  lastContact: string | null;
  lastResponseAt: string | null;
  movedAt: string | null;
  messageResponse: boolean | null;
  hasWhatsapp: boolean;
  templateId: number | null;
  pipelineId: number;
  beforePipelineId: number | null;
  tags: LeadTag[];
} & BaseModel;

export type LeadPipeline = {
  id: number;
  name: string;
};

export type LeadRow = Lead & {
  pipeline: LeadPipeline;
  beforePipeline: LeadPipeline | null;
};

export type ImportLeadRow = {
  row: number;
  contactName: string;
  phone: string;
  enrollmentDate?: string;
};

export type ImportIssue = {
  row: number;
  reason: string;
};

export type ImportLeadsResult = {
  created: number;
  skipped: ImportIssue[];
};
