import { and, or } from '@prisma/orm-postgres/orm-client';

import { db } from '@/prisma/db';
import { moveLeads, type Tx } from './moveLeads';

const MINUTE_MS = 60_000;

export type MovedLead = {
  leadId: number;
  workflowId: number;
  fromPipelineId: number;
  toPipelineId: number;
};

export type RunWorkflowsResult = {
  executedAt: string;
  dryRun: boolean;
  evaluatedWorkflows: number;
  movedLeads: MovedLead[];
};

const after = (a: string | null, b: string | null) => !b || (!!a && Date.parse(a) > Date.parse(b));

export function runWorkflows(dryRun = false, now = new Date()): Promise<RunWorkflowsResult> {
  return db.transaction((tx) => runWorkflowsIn(tx, dryRun, now));
}

export async function runWorkflowsIn(
  tx: Tx,
  dryRun = false,
  now = new Date(),
): Promise<RunWorkflowsResult> {
  const workflows = await tx.orm.public.WorkflowPipeline.where({ deletedAt: null })
    .orderBy((w) => w.id.desc())
    .all();

  const movedLeads: MovedLead[] = [];
  const handled = new Set<number>();

  for (const workflow of workflows) {
    const { id: workflowId, fromPipelineId, toPipelineId, waitingTime } = workflow;

    if (fromPipelineId === toPipelineId) continue;

    const limit = new Date(now.getTime() - waitingTime * MINUTE_MS).toISOString();
    const pipeline = tx.orm.public.Lead.where({ pipelineId: fromPipelineId, deletedAt: null });

    let ids: number[] = [];

    if (workflow.whenNotResponse) {
      const leads = await pipeline
        .where((l) =>
          and(
            or(l.messageResponse.isNull(), l.messageResponse.eq(false)),
            l.lastContact.lte(limit),
            or(l.movedAt.isNull(), l.movedAt.lte(limit)),
          ),
        )
        .all();

      ids = leads.map(({ id }) => id);
    } else if (workflow.whenResponse) {
      const leads = await pipeline
        .where((l) => and(l.messageResponse.eq(true), l.lastResponseAt.lte(limit)))
        .all();

      ids = leads.filter((l) => after(l.lastResponseAt, l.movedAt)).map(({ id }) => id);
    } else if (workflow.whenSendMessage) {
      const leads = await pipeline.where((l) => l.lastContact.lte(limit)).all();

      ids = leads.filter((l) => after(l.lastContact, l.movedAt)).map(({ id }) => id);
    }

    ids = ids.filter((id) => !handled.has(id));

    if (!ids.length) continue;

    const moved = dryRun
      ? ids
      : await moveLeads(tx, ids, fromPipelineId, toPipelineId, now.toISOString());

    for (const leadId of moved) {
      handled.add(leadId);
      movedLeads.push({ leadId, workflowId, fromPipelineId, toPipelineId });
    }
  }

  console.log(
    `[cron:workflows]${dryRun ? ' [DRY RUN]' : ''} ${workflows.length} workflow(s) evaluados, ` +
      `${movedLeads.length} lead(s) ${dryRun ? 'se moverían' : 'movidos'}`,
  );

  return {
    executedAt: now.toISOString(),
    dryRun,
    evaluatedWorkflows: workflows.length,
    movedLeads,
  };
}
