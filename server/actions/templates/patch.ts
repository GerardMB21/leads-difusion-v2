'use server';

import type { Template } from '@/app/templates/types';

import {
  imageSchema,
  updateTemplateSchema,
  type UpdateTemplateInput,
} from '@/app/templates/schemas';
import { db } from '@/prisma/db';
import { sanitizeMessage } from '@/server/sanitize';
import { TEMPLATE_NOT_FOUND, TEMPLATES_BUCKET } from '@/server/queries/templates';
import { deleteFile, uploadFile } from '@/server/storage';

export async function patchTemplate(
  id: number,
  input: UpdateTemplateInput,
  image?: File | null,
): Promise<Template> {
  const { removeImage, ...parsed } = updateTemplateSchema.parse(input);
  const data = {
    ...parsed,
    ...(parsed.message !== undefined && { message: sanitizeMessage(parsed.message) }),
  };
  const file = image ? imageSchema.parse(image) : null;

  const current = await db.orm.public.Template.where({ id, deletedAt: null }).first();

  if (!current) throw new Error(TEMPLATE_NOT_FOUND);

  const uploaded = file ? await uploadFile(TEMPLATES_BUCKET, file) : null;
  const replacesImage = !!uploaded || !!removeImage;

  let updated: Template | null;

  try {
    updated = await db.orm.public.Template.where({ id, deletedAt: null }).update({
      ...data,
      ...(replacesImage && { img: uploaded?.url ?? null }),
    });
  } catch (error) {
    if (uploaded) await deleteFile(TEMPLATES_BUCKET, uploaded.path).catch(() => undefined);

    throw error;
  }

  if (!updated) throw new Error(TEMPLATE_NOT_FOUND);

  if (replacesImage && current.img) {
    await deleteFile(TEMPLATES_BUCKET, current.img).catch((error) =>
      console.error('Delete old template image error: ', error),
    );
  }

  return updated;
}
