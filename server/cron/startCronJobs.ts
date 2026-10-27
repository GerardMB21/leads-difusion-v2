import cron from 'node-cron';

import { runWorkflows } from '@/server/workflows/run';

const WORKFLOWS_SCHEDULE = process.env.CRON_WORKFLOWS_SCHEDULE || '*/5 * * * *';

let started = false;

export function startCronJobs() {
  if (started || process.env.CRON_ENABLED === 'false') return;

  started = true;

  let isRunning = false;

  cron.schedule(WORKFLOWS_SCHEDULE, async () => {
    if (isRunning) {
      console.log('[cron] workflows ya esta corriendo, se omite este tick');

      return;
    }

    isRunning = true;

    try {
      await runWorkflows();
    } catch (error) {
      console.error('[cron] workflows fallo:', error);
    } finally {
      isRunning = false;
    }
  });

  console.log(`[cron] workflows programado con "${WORKFLOWS_SCHEDULE}"`);
}
