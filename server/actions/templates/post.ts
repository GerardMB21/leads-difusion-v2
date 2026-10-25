'use server';

import type { Template } from '@/app/templates/types';

import {
  createTemplateSchema,
  imageSchema,
  type CreateTemplateInput,
} from '@/app/templates/schemas';
import { db } from '@/prisma/db';
import { TEMPLATES_BUCKET } from '@/server/queries/templates';
import { deleteFile, uploadFile } from '@/server/storage';

export async function createTemplate(
  input: CreateTemplateInput,
  image?: File | null,
): Promise<Template> {
  const data = createTemplateSchema.parse(input);
  const file = image ? imageSchema.parse(image) : null;
  const uploaded = file ? await uploadFile(TEMPLATES_BUCKET, file) : null;

  try {
    return await db.orm.public.Template.create({ ...data, img: uploaded?.url ?? null });
  } catch (error) {
    if (uploaded) await deleteFile(TEMPLATES_BUCKET, uploaded.path).catch(() => undefined);

    throw error;
  }
}
