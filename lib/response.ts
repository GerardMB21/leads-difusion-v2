import type { NormalizedError } from '@/lib/types';

const FOREIGN_KEY_VIOLATION = '23503';
const UNIQUE_VIOLATION = '23505';

export function errorResponse({ status, message }: NormalizedError) {
  return Response.json({ status, message } satisfies NormalizedError, { status });
}

export function handleDbError(error: unknown, { notFound, fallback }: Record<string, string>) {
  if (error instanceof Error && error.message === notFound) {
    return errorResponse({ status: 404, message: notFound });
  }

  if ((error as { sqlState?: string }).sqlState === FOREIGN_KEY_VIOLATION) {
    return errorResponse({
      status: 400,
      message: 'Referencia inválida: el pipeline, la plantilla o la etiqueta no existe',
    });
  }

  if ((error as { sqlState?: string }).sqlState === UNIQUE_VIOLATION) {
    return errorResponse({ status: 409, message: 'Ya existe un registro con ese nombre' });
  }

  console.error(`${fallback}: `, error);

  return errorResponse({ status: 500, message: fallback });
}
