import type { NextConfig } from "next";

// STATIC_EXPORT=1 builds a plain HTML/JS site for GitHub Pages (see
// .github/workflows/deploy.yml). There is no server there, so:
//  • `pageExtensions: ["tsx"]` skips the `route.ts` API handlers — the browser
//    runs them itself via `src/lib/api-fetch.ts`.
//  • NEXT_PUBLIC_BASE_PATH is the repo sub-path, e.g. "/mein-chatbot".
const staticExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = staticExport
  ? {
      output: "export",
      pageExtensions: ["tsx"],
      basePath,
      trailingSlash: true,
      images: { unoptimized: true },
      env: { NEXT_PUBLIC_STATIC_EXPORT: "1", NEXT_PUBLIC_BASE_PATH: basePath },
      experimental: {
        optimizePackageImports: ["katex", "react-markdown"],
      },
    }
  : {
      // Minimal server bundle for the Electron desktop build.
      output: "standalone",
      // Electron loads http://127.0.0.1:PORT while `next dev` defaults to localhost.
      // Without this, dev HMR is blocked and the client never hydrates — clicks do nothing.
      allowedDevOrigins: ["127.0.0.1"],
      experimental: {
        optimizePackageImports: ["katex", "react-markdown"],
      },
    };

export default nextConfig;
