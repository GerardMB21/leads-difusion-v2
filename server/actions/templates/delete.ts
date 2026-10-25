'use server';

import { db } from '@/prisma/db';
import { TEMPLATE_NOT_FOUND, TEMPLATES_BUCKET } from '@/server/queries/templates';
import { deleteFile } from '@/server/storage';

export async function deleteTemplate(id: number): Promise<void> {
  const current = await db.orm.public.Template.where({ id, deletedAt: null }).first();

  if (!current) throw new Error(TEMPLATE_NOT_FOUND);

  await db.orm.public.Template.where({ id }).update({
    deletedAt: new Date().toISOString(),
    img: null,
  });

  if (current.img) {
    await deleteFile(TEMPLATES_BUCKET, current.img).catch((error) =>
      console.error('Delete template image error: ', error),
    );
  }
}
