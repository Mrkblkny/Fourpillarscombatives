// Four Pillars Combatives — Cloudflare Worker for the online training path.
// Add this Worker as a ROUTE for fourpillarscombatives.com/online-training*
// after the training Pages app is ready. Do not replace the apex Pages project.
const SITE_HOST = 'fourpillarscombatives.com';
const TRAINING_MIRROR = 'https://training-origin.fourpillarscombatives.com';
const MOUNT = '/online-training';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname !== SITE_HOST) {
      return new Response('Not found', { status: 404 });
    }

    // Canonical slash is necessary for ./assets and ./logo to resolve correctly.
    if (url.pathname === MOUNT) {
      url.pathname = MOUNT + '/';
      return Response.redirect(url.href, 308);
    }

    if (!url.pathname.startsWith(MOUNT + '/')) {
      return new Response('Not found', { status: 404 });
    }

    // Rewrite /online-training/api/config -> /api/config on the training app.
    const upstream = new URL(TRAINING_MIRROR);
    upstream.pathname = url.pathname.slice(MOUNT.length);
    upstream.search = url.search;

    // Cloning the incoming Request forwards its method, body and auth headers.
    // The Request constructor replaces the upstream Host header.
    const response = await fetch(new Request(upstream, request), {
      redirect: 'manual',
    });

    // Keep any upstream redirects on our public path, not on the mirror host.
    const headers = new Headers(response.headers);
    const target = headers.get('location');
    if (target) {
      const redirect = new URL(target, upstream);
      if (redirect.origin === new URL(TRAINING_MIRROR).origin) {
        const publicRedirect = new URL(url);
        publicRedirect.pathname = MOUNT + redirect.pathname;
        publicRedirect.search = redirect.search;
        publicRedirect.hash = redirect.hash;
        headers.set('location', publicRedirect.toString());
      }
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
