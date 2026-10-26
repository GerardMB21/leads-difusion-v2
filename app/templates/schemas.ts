import { z } from 'zod';

import { OrderBy } from '@/lib/types';

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

export const imageSchema = z
  .instanceof(File, { error: 'La imagen debe ser un archivo' })
  .refine(({ type }) => IMAGE_TYPES.includes(type), 'Solo se permiten png, jpg, webp o gif')
  .refine(({ size }) => size <= MAX_IMAGE_SIZE, 'La imagen supera los 5 MB');

const hasText = (html: string) =>
  html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim().length > 0;

const message = z.string().trim().refine(hasText, 'El mensaje es obligatorio');

export const createTemplateSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  message,
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;

export const updateTemplateSchema = createTemplateSchema.partial().extend({
  removeImage: z.boolean().optional(),
});

export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;

export const templateFiltersSchema = z.object({
  name: z.string().optional(),
  orderBy: z.enum(OrderBy).optional(),
});

export type TemplateFilters = z.infer<typeof templateFiltersSchema>;
