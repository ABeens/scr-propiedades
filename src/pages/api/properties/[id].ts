import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, locals }) => {
  const { env } = locals.runtime;
  const db = env.DB;

  try {
    const row: any = await db.prepare('SELECT * FROM properties WHERE id = ?').bind(params.id).first();

    if (!row) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    row.images = JSON.parse(row.images || '[]');

    return new Response(JSON.stringify(row), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const { env } = locals.runtime;
  const db = env.DB;

  try {
    const body = await request.json();

    await db.prepare(`
      UPDATE properties SET
        title = ?, price = ?, price_display = ?, price_usd = ?, price_display_usd = ?,
        type = ?, location = ?, provincia_id = ?, canton_id = ?, distrito_id = ?,
        beds = ?, baths = ?, area = ?, parking = ?,
        property_type = ?, status = ?, description = ?,
        images = ?, instagram = ?, video = ?,
        lat = ?, lng = ?, contact_number = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      body.title, body.price, body.price_display, body.price_usd, body.price_display_usd,
      body.type, body.location, body.provincia_id || null, body.canton_id || null, body.distrito_id || null,
      body.beds || 0, body.baths || 0, body.area, body.parking || 0,
      body.property_type, body.status || 'available', body.description || null,
      JSON.stringify(body.images || []),
      body.instagram || null, body.video || null,
      body.lat || null, body.lng || null,
      body.contact_number || '50670141868',
      params.id
    ).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { env } = locals.runtime;
  const db = env.DB;

  try {
    await db.prepare('DELETE FROM properties WHERE id = ?').bind(params.id).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
