import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, locals }) => {
  const { env } = locals.runtime;
  const bucket = env.IMAGES_BUCKET;

  const key = `properties/${params.path}`;
  const object = await bucket.get(key);

  if (!object) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(object.body as ReadableStream, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
