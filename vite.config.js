import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

/**
 * One address for everything: the browser only talks to this Vite server,
 * which forwards /api and /uploads to the Spring Boot backend.
 * That makes it work the same on localhost, on other computers in the
 * network, and through a Cloudflare tunnel (no CORS, no second URL).
 *
 * Settings (in .env.local or the environment):
 *   BACKEND_URL    where the backend runs            (default http://localhost:8080)
 *   ALLOWED_HOSTS  extra host names, comma separated (e.g. eams.example.com)
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backend = env.BACKEND_URL || "http://localhost:8080";

  const forward = {
    target: backend,
    changeOrigin: true,
    configure: (proxy) => {
      // The request now comes from this server, so the browser's Origin header
      // would make Spring treat it as a cross-site (CORS) request and reject it.
      proxy.on("proxyReq", (proxyReq) => proxyReq.removeHeader("origin"));
    },
  };
  const proxy = { "/api": forward, "/uploads": forward };

  // Vite refuses unknown host names by default (protection against DNS rebinding).
  const allowedHosts = [
    "localhost",
    ".trycloudflare.com", // free Cloudflare quick tunnels
    ".ngrok-free.app", // ngrok free plan
    ...(env.ALLOWED_HOSTS || "").split(",").map((h) => h.trim()).filter(Boolean),
  ];

  return {
    plugins: [react()],
    server: { proxy, allowedHosts },
    preview: { proxy, allowedHosts },
  };
});
