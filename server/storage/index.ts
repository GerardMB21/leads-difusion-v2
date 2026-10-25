import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) throw new Error('Faltan SUPABASE_URL o SUPABASE_SECRET_KEY');

  client ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  return client;
}

const EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function uploadFile(bucket: string, file: File) {
  const extension = EXTENSIONS[file.type];

  if (!extension) throw new Error('Tipo de archivo no permitido');

  const path = `${crypto.randomUUID()}.${extension}`;
  const storage = getClient().storage.from(bucket);

  const { error } = await storage.upload(path, await file.arrayBuffer(), {
    contentType: file.type,
    upsert: false,
  });

  if (error) throw new Error(`No se pudo subir el archivo: ${error.message}`);

  return { path, url: storage.getPublicUrl(path).data.publicUrl };
}

export async function deleteFile(bucket: string, pathOrUrl: string) {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = pathOrUrl.indexOf(marker);
  const path = index === -1 ? pathOrUrl : pathOrUrl.slice(index + marker.length);

  const { error } = await getClient().storage.from(bucket).remove([path]);

  if (error) throw new Error(`No se pudo eliminar el archivo: ${error.message}`);
}
