import { z } from 'zod';

import { createLeadSchema, deleteLeadsSchema, leadFiltersSchema } from '@/app/leads/schemas';
import { errorResponse, handleDbError } from '@/lib/response';
import { deleteLeads } from '@/server/actions/leads/delete';
import { getLeads } from '@/server/actions/leads/get';
import { createLead } from '@/server/actions/leads/post';
import { LEAD_NOT_FOUND } from '@/server/queries/leads';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = leadFiltersSchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return errorResponse({ status: 400, message: z.prettifyError(parsed.error) });
  }

  try {
    return Response.json(await getLeads(parsed.data));
  } catch (error) {
    return handleDbError(error, {
      notFound: LEAD_NOT_FOUND,
      fallback: 'No se pudieron obtener los leads',
    });
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = createLeadSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse({ status: 400, message: z.prettifyError(parsed.error) });
  }

  try {
    return Response.json(await createLead(parsed.data), { status: 201 });
  } catch (error) {
    return handleDbError(error, {
      notFound: LEAD_NOT_FOUND,
      fallback: 'No se pudo crear el lead',
    });
  }
}

export async function DELETE(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = deleteLeadsSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse({ status: 400, message: z.prettifyError(parsed.error) });
  }

  try {
    return Response.json({ deleted: await deleteLeads(parsed.data) });
  } catch (error) {
    return handleDbError(error, {
      notFound: LEAD_NOT_FOUND,
      fallback: 'No se pudieron eliminar los leads',
    });
  }
}
