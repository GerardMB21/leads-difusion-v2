import { connection } from 'next/server';

import { getCurrentDiffusion } from '@/server/actions/diffusions/get';
import { subscribeDiffusionChange } from '@/server/diffusions/events';

const HEARTBEAT_MS = 25_000;

export async function GET(req: Request) {
  await connection();

  const encoder = new TextEncoder();
  let close = () => {};

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      let sending = false;
      let queued = false;

      const write = (chunk: string) => {
        if (!closed) controller.enqueue(encoder.encode(chunk));
      };

      const push = async () => {
        if (sending) {
          queued = true;

          return;
        }

        sending = true;

        try {
          do {
            queued = false;
            write(`data: ${JSON.stringify(await getCurrentDiffusion())}\n\n`);
          } while (queued && !closed);
        } catch (error) {
          console.error('Diffusion stream error: ', error);
        } finally {
          sending = false;
        }
      };

      const unsubscribe = subscribeDiffusionChange(push);
      const heartbeat = setInterval(() => write(': ping\n\n'), HEARTBEAT_MS);

      close = () => {
        if (closed) return;

        closed = true;
        clearInterval(heartbeat);
        unsubscribe();
        req.signal.removeEventListener('abort', close);

        try {
          controller.close();
        } catch {}
      };

      req.signal.addEventListener('abort', close);
      void push();
    },
    cancel() {
      close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
