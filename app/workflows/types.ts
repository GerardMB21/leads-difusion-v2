import type { BaseModel } from '@/lib/types';

export type WorkflowPipeline = {
  id: number;
  name: string;
};

export type Workflow = {
  name: string;
  fromPipelineId: number;
  toPipelineId: number;
  whenNotResponse: boolean;
  whenSendMessage: boolean;
  waitingTime: number;
} & BaseModel;

export type WorkflowRow = Workflow & {
  fromPipeline: WorkflowPipeline;
  toPipeline: WorkflowPipeline;
};
