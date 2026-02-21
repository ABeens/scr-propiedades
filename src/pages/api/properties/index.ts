import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const { env } = locals.runtime;
  const db = env.DB;

  try {
    const { results } = await db.prepare('SELECT * FROM properties ORDER BY created_at DESC').all();

    const properties = results.map((row: any) => ({
      ...row,
      images: JSON.parse(row.images || '[]'),
    }));

    return new Response(JSON.stringify(properties), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const { env } = locals.runtime;
  const db = env.DB;

  try {
    const body = await request.json();
    const id = body.id || crypto.randomUUID();

    await db.prepare(`
      INSERT INTO properties (id, title, price, price_display, price_usd, price_display_usd, type, location, provincia_id, canton_id, distrito_id, beds, baths, area, parking, property_type, status, description, images, instagram, video, lat, lng, contact_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, body.title, body.price, body.price_display, body.price_usd, body.price_display_usd,
      body.type, body.location, body.provincia_id || null, body.canton_id || null, body.distrito_id || null,
      body.beds || 0, body.baths || 0, body.area, body.parking || 0,
      body.property_type, body.status || 'available', body.description || null,
      JSON.stringify(body.images || []),
      body.instagram || null, body.video || null,
      body.lat || null, body.lng || null,
      body.contact_number || '50670141868'
    ).run();

    return new Response(JSON.stringify({ id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
