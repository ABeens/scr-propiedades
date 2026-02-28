import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async ({ request, locals, redirect, url }, next) => {
  const pathname = url.pathname;
  const method = request.method;

  // Public routes - no auth needed
  const isPublicPage = pathname === '/' ||
    pathname === '/catalog' ||
    pathname.startsWith('/propiedad/') ||
    pathname.startsWith('/api/images/');

  const isPublicAPI = pathname.startsWith('/api/properties') && method === 'GET';
  const isLoginPage = pathname === '/admin/login';
  const isStaticAsset = pathname.includes('.') && !pathname.startsWith('/api/') && !pathname.startsWith('/admin/');

  if (isPublicPage || isPublicAPI || isLoginPage || isStaticAsset) {
    return next();
  }

  // Protected routes - check auth
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/')) {
    const cookie = request.headers.get('cookie') || '';
    const sessionMatch = cookie.match(/admin-session=([^;]+)/);

    let authenticated = false;
    const { env } = locals.runtime;

    let users: Record<string, string> = {};
    try {
      users = JSON.parse(env.ADMIN_USERS || '{}');
    } catch {}

    if (sessionMatch) {
      const sessionValue = decodeURIComponent(sessionMatch[1]);
      const colonIdx = sessionValue.indexOf(':');
      if (colonIdx > 0) {
        const username = sessionValue.substring(0, colonIdx);
        const token = sessionValue.substring(colonIdx + 1);
        if (users[username]) {
          const expectedToken = await hashPassword(username + ':' + users[username]);
          authenticated = token === expectedToken;
        }
      }
    }

    if (!authenticated) {
      if (pathname.startsWith('/api/')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return redirect('/admin/login');
    }
  }

  return next();
});

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}
