import cron from 'node-cron';

import { runDiffusions } from '@/server/diffusions/run';

const DIFFUSIONS_SCHEDULE = process.env.CRON_DIFFUSIONS_SCHEDULE || '*/15 * * * * *';

export function startDiffusionsCron() {
  let isRunning = false;

  cron.schedule(DIFFUSIONS_SCHEDULE, async () => {
    if (isRunning) return;

    isRunning = true;

    try {
      await runDiffusions();
    } catch (error) {
      console.error('[cron] diffusions fallo:', error);
    } finally {
      isRunning = false;
    }
  });

  console.log(`[cron] diffusions programado con "${DIFFUSIONS_SCHEDULE}"`);
}
