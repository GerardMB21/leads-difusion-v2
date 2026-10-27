import { z } from 'zod';

import { OrderBy } from '@/lib/types';

const tagName = z
  .string()
  .trim()
  .min(1, 'La etiqueta no puede estar vacía')
  .max(50, 'Máximo 50 caracteres');

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
  lastContact: z.iso.datetime({ offset: true, error: 'Fecha inválida' }).nullable().optional(),
  messageResponse: z.boolean().optional(),
  templateId: id.nullable().optional(),
  pipelineId: id,
  beforePipelineId: id.nullable().optional(),
  tagIds: z.array(id).optional(),
  tagNames: z.array(tagName).optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const updateLeadSchema = createLeadSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'Debes enviar al menos un campo');

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

export const leadFiltersSchema = z.object({
  search: z
    .string()
    .trim()
    .max(100, 'Máximo 100 caracteres')
    .transform((value) => value || undefined)
    .optional(),
  pipelineId: z.coerce.number().int().optional(),
  tagIds: z
    .preprocess(
      (value) => (typeof value === 'string' ? value.split(',').filter(Boolean).map(Number) : value),
      z.array(z.number().int().min(1)),
    )
    .optional(),
  templateId: z.coerce.number().int().optional(),
  messageResponse: z.union([z.boolean(), z.stringbool()]).optional(),
  orderBy: z.enum(OrderBy).optional(),
});

export type LeadFilters = z.infer<typeof leadFiltersSchema>;

export const leadFormSchema = z.object({
  contactName: createLeadSchema.shape.contactName,
  phone: createLeadSchema.shape.phone,
  enrollmentDate: z.string().min(1, 'La fecha es obligatoria'),
  tags: z.array(tagName),
});

export type LeadFormInput = z.infer<typeof leadFormSchema>;

export const importLeadsSchema = z.object({
  pipelineId: z.coerce.number().pipe(id),
  tagNames: z.array(tagName),
});

export type ImportLeadsInput = z.infer<typeof importLeadsSchema>;

export const importLeadRowSchema = z.object({
  row: z.number().int().min(2),
  contactName: createLeadSchema.shape.contactName,
  phone: createLeadSchema.shape.phone,
  enrollmentDate: createLeadSchema.shape.enrollmentDate,
});

export const deleteLeadsSchema = z.object({
  ids: z.array(id).min(1, 'Selecciona al menos un lead').max(1000, 'Máximo 1000 leads a la vez'),
});

export type DeleteLeadsInput = z.infer<typeof deleteLeadsSchema>;
