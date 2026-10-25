import type { BaseModel } from '@/lib/types';
import type { LeadTag } from '@/app/pipelines/types';

export type Lead = {
  contactName: string;
  phone: string;
  order: number;
  enrollmentDate: string;
  lastContact: number | null;
  messageResponse: boolean | null;
  templateId: number | null;
  pipelineId: number;
  beforePipelineId: number | null;
  tags: LeadTag[];
} & BaseModel;
