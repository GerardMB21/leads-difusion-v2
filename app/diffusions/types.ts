import type { BaseModel } from '@/lib/types';
import type { LeadTag } from '@/app/pipelines/types';

export type DiffusionStatus =
  'active' | 'pending' | 'cancelled' | 'sending' | 'completed' | 'failed' | 'stopped';

export type LeadInDiffusionStatus = 'pending' | 'sending' | 'sent' | 'failed';

export type Diffusion = {
  pipelineId: number | null;
  status: DiffusionStatus;
  total: number;
  processed: number;
  sent: number;
  failed: number;
  startAt: string | null;
  finishedAt: string | null;
  nextSendAt: string | null;
  beforeSendAt: string | null;
  stoppedAt: string | null;
  restartAt: string | null;
  error: string | null;
  errorServer: number;
} & BaseModel;

export type TagInDiffusion = {
  tagId: number;
  diffusionId: number;
};

export type TemplateInDiffusion = {
  templateId: number;
  diffusionId: number;
};

export type LeadInDiffusion = {
  diffusionId: number;
  leadId: number;
  templateId: number | null;
  status: LeadInDiffusionStatus;
  waited: number | null;
  sentAt: string | null;
  error: string | null;
} & BaseModel;

export type DiffusionTemplate = {
  id: number;
  name: string;
};

export type DiffusionPipeline = {
  id: number;
  name: string;
};

export type DiffusionLead = {
  id: number;
  contactName: string;
  phone: string;
};

export type DiffusionRow = Diffusion & {
  pipeline: DiffusionPipeline | null;
  tags: LeadTag[];
  templates: DiffusionTemplate[];
};

export type DiffusionLeadRow = LeadInDiffusion & {
  lead: DiffusionLead;
  template: DiffusionTemplate | null;
};
