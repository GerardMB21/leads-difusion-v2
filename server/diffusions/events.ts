import { EventEmitter } from 'node:events';

const EVENT = 'change';

const globalForEvents = globalThis as unknown as { __diffusionEvents?: EventEmitter };

const emitter = globalForEvents.__diffusionEvents ?? new EventEmitter().setMaxListeners(0);

globalForEvents.__diffusionEvents = emitter;

export function publishDiffusionChange() {
  emitter.emit(EVENT);
}

export function subscribeDiffusionChange(listener: () => void) {
  emitter.on(EVENT, listener);

  return () => {
    emitter.off(EVENT, listener);
  };
}
