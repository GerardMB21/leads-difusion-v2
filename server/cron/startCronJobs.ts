import { startDiffusionsCron } from './startDiffusionsCron';
import { startWorkflowsCron } from './startWorkflowsCron';

let started = false;

export function startCronJobs() {
  if (started || process.env.CRON_ENABLED === 'false') return;

  started = true;

  startDiffusionsCron();
  startWorkflowsCron();
}
