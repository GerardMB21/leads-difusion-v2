import { z } from 'zod';

import { OrderBy } from '@/lib/types';

export const MAX_HOURS = 999;
export const MAX_WAITING_TIME = MAX_HOURS * 60 + 59;

const id = z.number({ error: 'Debe ser un número' }).int('Debe ser un entero').min(1);

const pipelineName = z
  .string()
  .trim()
  .min(1, 'El nombre del pipeline es obligatorio')
  .max(100, 'Máximo 100 caracteres');

const workflowFields = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  fromPipelineId: id.optional(),
  fromPipelineName: pipelineName.optional(),
  toPipelineId: id.optional(),
  toPipelineName: pipelineName.optional(),
  whenNotResponse: z.boolean(),
  whenSendMessage: z.boolean(),
  waitingTime: z
    .number({ error: 'El tiempo de espera debe ser un número' })
    .int('El tiempo de espera debe ser un entero')
    .min(0, 'El tiempo de espera no puede ser negativo')
    .max(MAX_WAITING_TIME, 'El tiempo de espera es demasiado largo'),
});

type Fields = Partial<z.infer<typeof workflowFields>>;

const NEEDS_PIPELINE = 'Indica el pipeline por id o por nombre, no ambos';

const bothPipelineRefs = (value: Fields, side: 'from' | 'to') =>
  value[`${side}PipelineId`] !== undefined && value[`${side}PipelineName`] !== undefined;

const noTrigger = (value: Fields) => value.whenNotResponse === value.whenSendMessage;

export const createWorkflowSchema = workflowFields
  .refine((value) => !bothPipelineRefs(value, 'from'), {
    path: ['fromPipelineId'],
    message: NEEDS_PIPELINE,
  })
  .refine((value) => value.fromPipelineId !== undefined || value.fromPipelineName !== undefined, {
    path: ['fromPipelineId'],
    message: 'El pipeline de origen es obligatorio',
  })
  .refine((value) => !bothPipelineRefs(value, 'to'), {
    path: ['toPipelineId'],
    message: NEEDS_PIPELINE,
  })
  .refine((value) => value.toPipelineId !== undefined || value.toPipelineName !== undefined, {
    path: ['toPipelineId'],
    message: 'El pipeline de destino es obligatorio',
  })
  .refine((value) => !noTrigger(value), {
    path: ['whenNotResponse'],
    message: 'Elige cuándo se activa: cuando no responde o se envía mensaje',
  });

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;

export const updateWorkflowSchema = workflowFields
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'Debes enviar al menos un campo')
  .refine((value) => !bothPipelineRefs(value, 'from') && !bothPipelineRefs(value, 'to'), {
    message: NEEDS_PIPELINE,
  })
  .refine(
    (value) =>
      value.whenNotResponse === undefined ||
      value.whenSendMessage === undefined ||
      !noTrigger(value),
    { path: ['whenNotResponse'], message: 'Elige solo una condición de activación' },
  );

export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>;

export const workflowFiltersSchema = z.object({
  name: z
    .string()
    .trim()
    .max(100, 'Máximo 100 caracteres')
    .transform((value) => value || undefined)
    .optional(),
  trigger: z.enum(['notResponse', 'sendMessage']).optional(),
  fromPipelineId: z.coerce.number().int().optional(),
  toPipelineId: z.coerce.number().int().optional(),
  orderBy: z.enum(OrderBy).optional(),
});

export type WorkflowFilters = z.infer<typeof workflowFiltersSchema>;

export const TRIGGERS = [
  { value: 'notResponse', label: 'No responde' },
  { value: 'sendMessage', label: 'Se envía mensaje' },
] as const;

export type Trigger = (typeof TRIGGERS)[number]['value'];

export const pipelineOptionSchema = z.object({
  id: id.nullable(),
  name: pipelineName,
});

export type PipelineOption = z.infer<typeof pipelineOptionSchema>;

export const workflowFormSchema = z
  .object({
    name: workflowFields.shape.name,
    from: pipelineOptionSchema.nullable(),
    to: pipelineOptionSchema.nullable(),
    trigger: z.enum(['notResponse', 'sendMessage']),
    hours: z
      .number({ error: 'Las horas deben ser un número' })
      .int('Las horas deben ser un entero')
      .min(0, 'Mínimo 0')
      .max(MAX_HOURS, `Máximo ${MAX_HOURS}`),
    minutes: z
      .number({ error: 'Los minutos deben ser un número' })
      .int('Los minutos deben ser un entero')
      .min(0, 'Mínimo 0')
      .max(59, 'Máximo 59'),
  })
  .refine((value) => value.from !== null, {
    path: ['from'],
    message: 'El pipeline de origen es obligatorio',
  })
  .refine((value) => value.to !== null, {
    path: ['to'],
    message: 'El pipeline de destino es obligatorio',
  })
  .refine(
    (value) =>
      !value.from || !value.to || value.from.name.toLowerCase() !== value.to.name.toLowerCase(),
    { path: ['to'], message: 'El destino debe ser distinto al origen' },
  );

export type WorkflowFormInput = z.infer<typeof workflowFormSchema>;
