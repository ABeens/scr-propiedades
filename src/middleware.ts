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
    const authHeader = request.headers.get('Authorization');

    let authenticated = false;

    if (sessionMatch) {
      const token = sessionMatch[1];
      // Simple token validation - the token is a hash of the password
      const { env } = locals.runtime;
      const expectedToken = await hashPassword(env.ADMIN_PASSWORD);
      authenticated = token === expectedToken;
    }

    if (!authenticated && authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const { env } = locals.runtime;
      const expectedToken = await hashPassword(env.ADMIN_PASSWORD);
      authenticated = token === expectedToken;
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
