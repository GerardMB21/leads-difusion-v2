'use server';

import { sendTemplateSchema, type SendTemplateInput } from '@/app/whatsapp/schemas';
import { db } from '@/prisma/db';
import { LEAD_NOT_FOUND } from '@/server/queries/leads';
import { TEMPLATE_NOT_FOUND } from '@/server/queries/templates';
import { sendTemplateMessage } from '@/server/whatsapp/evolution';

export async function sendTemplate(input: SendTemplateInput): Promise<void> {
  const { leadId, templateId } = sendTemplateSchema.parse(input);

  const lead = await db.orm.public.Lead.where({ id: leadId, deletedAt: null }).first();

  if (!lead) throw new Error(LEAD_NOT_FOUND);

  const template = await db.orm.public.Template.where({ id: templateId, deletedAt: null }).first();

  if (!template) throw new Error(TEMPLATE_NOT_FOUND);

  await sendTemplateMessage({ phone: lead.phone, template });
}
