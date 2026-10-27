import { z } from 'zod';

export const sendTemplateSchema = z.object({
  leadId: z.number({ error: 'Debe ser un número' }).int('Debe ser un entero').min(1),
  templateId: z.number({ error: 'Debe ser un número' }).int('Debe ser un entero').min(1),
});

export type SendTemplateInput = z.infer<typeof sendTemplateSchema>;
