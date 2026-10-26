import { z } from 'zod';

export const sendTemplateSchema = z.object({
  phone: z.string().trim().min(1, 'El teléfono es obligatorio').max(30, 'Máximo 30 caracteres'),
  templateId: z.number({ error: 'Debe ser un número' }).int('Debe ser un entero').min(1),
});

export type SendTemplateInput = z.infer<typeof sendTemplateSchema>;
