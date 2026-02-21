import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  const { env } = locals.runtime;
  const bucket = env.IMAGES_BUCKET;

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return new Response(JSON.stringify({ error: 'No files provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const urls: string[] = [];

    for (const file of files) {
      const ext = file.name.split('.').pop() || 'jpg';
      const key = `properties/${Date.now()}-${crypto.randomUUID()}.${ext}`;

      await bucket.put(key, await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type },
      });

      // R2 public URL - uses the custom domain or r2.dev subdomain configured in Cloudflare
      // The actual public URL depends on your R2 bucket's public access configuration
      urls.push(`/api/images/${key}`);
    }

    return new Response(JSON.stringify({ urls }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
