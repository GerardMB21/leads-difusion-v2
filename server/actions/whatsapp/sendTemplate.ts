'use server';

import { sendTemplateSchema, type SendTemplateInput } from '@/app/whatsapp/schemas';
import { db } from '@/prisma/db';
import { TEMPLATE_NOT_FOUND } from '@/server/queries/templates';
import { sendTemplateMessage } from '@/server/whatsapp/evolution';

export async function sendTemplate(input: SendTemplateInput): Promise<void> {
  const { phone, templateId } = sendTemplateSchema.parse(input);

  const template = await db.orm.public.Template.where({ id: templateId, deletedAt: null }).first();

  if (!template) throw new Error(TEMPLATE_NOT_FOUND);

  await sendTemplateMessage({ phone, template });
}
