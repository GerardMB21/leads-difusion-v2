import { z } from 'zod';

import { createWorkflowSchema, workflowFiltersSchema } from '@/app/workflows/schemas';
import { errorResponse, handleDbError } from '@/lib/response';
import { getWorkflows } from '@/server/actions/workflows/get';
import { createWorkflow } from '@/server/actions/workflows/post';
import { WORKFLOW_NOT_FOUND, WORKFLOW_VALIDATION_ERRORS } from '@/server/queries/workflows';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = workflowFiltersSchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return errorResponse({ status: 400, message: z.prettifyError(parsed.error) });
  }

  try {
    return Response.json(await getWorkflows(parsed.data));
  } catch (error) {
    return handleDbError(error, {
      notFound: WORKFLOW_NOT_FOUND,
      fallback: 'No se pudieron obtener los workflows',
    });
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = createWorkflowSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse({ status: 400, message: z.prettifyError(parsed.error) });
  }

  try {
    return Response.json(await createWorkflow(parsed.data), { status: 201 });
  } catch (error) {
    if (error instanceof Error && WORKFLOW_VALIDATION_ERRORS.includes(error.message)) {
      return errorResponse({ status: 400, message: error.message });
    }

    return handleDbError(error, {
      notFound: WORKFLOW_NOT_FOUND,
      fallback: 'No se pudo crear el workflow',
    });
  }
}
