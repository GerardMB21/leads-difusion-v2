import { errorResponse } from '@/lib/response';
import { getTags } from '@/server/actions/tags/get';

export async function GET() {
  try {
    return Response.json(await getTags());
  } catch (error) {
    console.error('Get tags error: ', error);

    return errorResponse({ status: 500, message: 'No se pudieron obtener las etiquetas' });
  }
}
