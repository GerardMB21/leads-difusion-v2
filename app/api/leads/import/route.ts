import { z } from 'zod';

import { importLeadsSchema } from '@/app/leads/schemas';
import { errorResponse, handleDbError } from '@/lib/response';
import { importLeads } from '@/server/actions/leads/import';
import { PIPELINE_NOT_FOUND } from '@/server/queries/leads';
import { MISSING_COLUMNS, NO_VALID_ROWS, parseLeadsFile } from '@/server/parsers/leads';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = /\.(xlsx|csv)$/i;
const MAX_ERRORS_IN_MESSAGE = 5;

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const file = form?.get('file');

  if (!(file instanceof File)) {
    return errorResponse({ status: 400, message: 'Debes adjuntar un archivo' });
  }

  if (!ALLOWED_EXTENSIONS.test(file.name)) {
    return errorResponse({ status: 400, message: 'Solo se permiten archivos .xlsx o .csv' });
  }

  if (file.size > MAX_FILE_SIZE) {
    return errorResponse({ status: 400, message: 'El archivo supera los 5 MB' });
  }

  let tagNames: unknown;

  try {
    tagNames = JSON.parse(String(form?.get('tagNames') ?? '[]'));
  } catch {
    return errorResponse({ status: 400, message: 'Etiquetas inválidas' });
  }

  const parsed = importLeadsSchema.safeParse({ pipelineId: form?.get('pipelineId'), tagNames });

  if (!parsed.success) {
    return errorResponse({ status: 400, message: z.prettifyError(parsed.error) });
  }

  let parsedFile: ReturnType<typeof parseLeadsFile>;

  try {
    parsedFile = parseLeadsFile(await file.arrayBuffer());
  } catch (error) {
    const message = error instanceof Error ? error.message : '';

    if (message.startsWith(MISSING_COLUMNS) || message === NO_VALID_ROWS) {
      return errorResponse({ status: 400, message });
    }

    console.error('Parse leads file error: ', error);

    return errorResponse({ status: 400, message: 'No se pudo leer el archivo' });
  }

  const { rows, errors } = parsedFile;

  if (!rows.length) {
    const detail = errors
      .slice(0, MAX_ERRORS_IN_MESSAGE)
      .map(({ row, reason }) => `Fila ${row}: ${reason}`)
      .join('. ');

    return errorResponse({
      status: 400,
      message: detail ? `${NO_VALID_ROWS}. ${detail}` : NO_VALID_ROWS,
    });
  }

  try {
    const result = await importLeads(rows, parsed.data);

    if (!result.created) {
      return errorResponse({
        status: 400,
        message: `No se creó ningún lead. ${[...errors, ...result.skipped]
          .slice(0, MAX_ERRORS_IN_MESSAGE)
          .map(({ row, reason }) => `Fila ${row}: ${reason}`)
          .join('. ')}`,
      });
    }

    return Response.json(
      {
        created: result.created,
        skipped: [...errors, ...result.skipped].sort((a, b) => a.row - b.row),
      },
      { status: 201 },
    );
  } catch (error) {
    return handleDbError(error, {
      notFound: PIPELINE_NOT_FOUND,
      fallback: 'No se pudieron importar los leads',
    });
  }
}
