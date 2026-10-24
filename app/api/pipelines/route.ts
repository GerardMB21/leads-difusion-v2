import { getPipelines } from '@/server/actions/pipelines/get';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const query = Object.fromEntries(searchParams);

  const pipelines = await getPipelines(query);

  return Response.json(pipelines);
}
