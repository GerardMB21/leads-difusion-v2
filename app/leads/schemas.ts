import { z } from 'zod';

import { OrderBy } from '@/lib/types';

const id = z.number({ error: 'Debe ser un número' }).int('Debe ser un entero').min(1);

export const createLeadSchema = z.object({
  contactName: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'Máximo 100 caracteres'),
  phone: z.string().trim().min(1, 'El teléfono es obligatorio').max(30, 'Máximo 30 caracteres'),
  order: z
    .number({ error: 'El orden debe ser un número' })
    .int('El orden debe ser un entero')
    .min(0, 'El orden no puede ser negativo'),
  enrollmentDate: z.iso.datetime({ offset: true, error: 'Fecha inválida' }).optional(),
  lastContact: z.number().int().nullable().optional(),
  messageResponse: z.boolean().optional(),
  templateId: id.nullable().optional(),
  pipelineId: id,
  beforePipelineId: id.nullable().optional(),
  tagIds: z.array(id).optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const updateLeadSchema = createLeadSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'Debes enviar al menos un campo');

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

export const leadFiltersSchema = z.object({
  pipelineId: z.coerce.number().int().optional(),
  templateId: z.coerce.number().int().optional(),
  messageResponse: z.union([z.boolean(), z.stringbool()]).optional(),
  orderBy: z.enum(OrderBy).optional(),
});

export type LeadFilters = z.infer<typeof leadFiltersSchema>;
