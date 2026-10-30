import { z } from 'zod';

import { OrderBy } from '@/lib/types';

export const DIFFUSION_STATUSES = [
  { value: 'active', label: 'Activa' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'sending', label: 'Enviando' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' },
  { value: 'failed', label: 'Fallida' },
  { value: 'stopped', label: 'Detenida' },
] as const;

export const diffusionStatusSchema = z.enum([
  'active',
  'pending',
  'sending',
  'completed',
  'cancelled',
  'failed',
  'stopped',
]);

export const CANCELLABLE_STATUSES = ['active', 'pending', 'sending', 'failed'] as const;

export const isCancellable = (status: string) =>
  (CANCELLABLE_STATUSES as readonly string[]).includes(status);

export const STOPPABLE_STATUSES = ['active', 'pending', 'sending', 'failed'] as const;

export const isStoppable = (status: string) =>
  (STOPPABLE_STATUSES as readonly string[]).includes(status);

const id = z.number({ error: 'Debe ser un número' }).int('Debe ser un entero').min(1);

const startAt = z.iso.datetime({ offset: true, error: 'Fecha inválida' });

export const createDiffusionSchema = z.object({
  pipelineId: id.nullable().optional(),
  tagIds: z.array(id).default([]),
  templateIds: z.array(id).min(1, 'Selecciona al menos un template'),
  leadIds: z.array(id).min(1, 'Selecciona al menos un lead'),
  startAt: startAt.nullable().optional(),
});

export type CreateDiffusionInput = z.input<typeof createDiffusionSchema>;

export const updateDiffusionSchema = z
  .object({
    status: diffusionStatusSchema,
    startAt: startAt.nullable(),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'Debes enviar al menos un campo');

export type UpdateDiffusionInput = z.infer<typeof updateDiffusionSchema>;

export const diffusionFiltersSchema = z.object({
  id: z.coerce.number().int().optional(),
  status: diffusionStatusSchema.optional(),
  pipelineId: z.coerce.number().int().optional(),
  orderBy: z.enum(OrderBy).optional(),
});

export type DiffusionFilters = z.infer<typeof diffusionFiltersSchema>;

export const diffusionFormSchema = z.object({
  pipelineId: z.string().nullable(),
  tagIds: z.array(id),
  leads: z.array(z.object({ id, contactName: z.string(), phone: z.string() })),
  templateIds: z.array(id),
  startAt: z.string(),
});

export type DiffusionFormInput = z.infer<typeof diffusionFormSchema>;

const LIMA_OFFSET = '-05:00';

// `value` comes from <input type="datetime-local"> (YYYY-MM-DDTHH:mm) and is read as Lima time
// whatever the browser's timezone is. Lima has no daylight saving, so the offset is fixed.
export const limaToIso = (value: string) => new Date(`${value}:00${LIMA_OFFSET}`).toISOString();
