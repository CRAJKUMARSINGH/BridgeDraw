import { createServer } from "http";
import app from "./app";
import { setupVite, serveStatic, log } from "./vite";

(async () => {
  const server = createServer(app);

  // Only setup Vite in development. In production, serve static build.
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
