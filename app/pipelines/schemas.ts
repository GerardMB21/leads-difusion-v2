import { z } from 'zod';

export const createPipelineSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  order: z
    .number({ error: 'El orden debe ser un número' })
    .int('El orden debe ser un entero')
    .min(0, 'El orden no puede ser negativo'),
  default: z.boolean(),
});

export type CreatePipelineInput = z.infer<typeof createPipelineSchema>;

export const updatePipelineSchema = createPipelineSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'Debes enviar al menos un campo');

export type UpdatePipelineInput = z.infer<typeof updatePipelineSchema>;

const positiveId = z.number().int().min(1);
const position = z.number().int().min(0);

export const reorderSchema = z.object({
  pipelines: z.array(z.object({ id: positiveId, order: position })),
  leads: z.array(
    z.object({
      id: positiveId,
      order: position,
      pipelineId: positiveId,
      beforePipelineId: positiveId.optional(),
    }),
  ),
});

export type ReorderInput = z.infer<typeof reorderSchema>;
