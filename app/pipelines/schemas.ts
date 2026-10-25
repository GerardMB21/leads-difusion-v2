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
