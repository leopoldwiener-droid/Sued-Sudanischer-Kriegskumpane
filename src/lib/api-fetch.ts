// ─────────────────────────────────────────────────────────────────────────────
//  apiFetch — `fetch("/api/…")` that also works on a static host (GitHub Pages).
//
//  Normal build (`npm run dev` / Vercel): plain fetch to the Next.js routes.
//  Static export (NEXT_PUBLIC_STATIC_EXPORT=1): there is no server, so the same
//  route handlers are imported and executed right here in the browser. They only
//  use fetch / Request / Response / ReadableStream, which browsers have too.
//  The API key then comes from the user's settings (localStorage) only.
// ─────────────────────────────────────────────────────────────────────────────

type Handler = (req: Request) => Promise<Response>;
type RouteModule = { GET?: Handler; POST?: Handler };

const STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

// Gated on the inlined env flag so server builds don't bundle the handlers.
const ROUTES: Record<string, () => Promise<RouteModule>> = STATIC_EXPORT
  ? {
      "/api/chat": () => import("@/app/api/chat/route"),
      "/api/generate-title": () => import("@/app/api/generate-title/route"),
      "/api/models/capabilities": () => import("@/app/api/models/capabilities/route"),
      "/api/ollama/models": () => import("@/app/api/ollama/models/route"),
      "/api/search": () => import("@/app/api/search/route"),
      "/api/tts": () => import("@/app/api/tts/route"),
    }
  : {};

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  if (!STATIC_EXPORT) return fetch(path, init);

  const url = new URL(path, window.location.origin);
  const load = ROUTES[url.pathname];
  if (!load) return new Response(`Unknown API route: ${url.pathname}`, { status: 404 });

  const mod = await load();
  const method = (init.method ?? "GET").toUpperCase();
  const handler = method === "POST" ? mod.POST : mod.GET;
  if (!handler) return new Response("Method not allowed.", { status: 405 });

  return handler(new Request(url, init));
}
