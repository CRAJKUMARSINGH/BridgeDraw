import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Minimal API request logger (safe for serverless)
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

  const originalResJson = res.json.bind(res);
  res.json = function (bodyJson: any, ...args: any[]) {
    capturedJsonResponse = bodyJson as Record<string, unknown>;
    return originalResJson(bodyJson, ...args);
  } as any;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let line = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        try {
          line += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } catch {}
      }
      if (line.length > 80) line = line.slice(0, 79) + "…";
      console.log(line);
    }
  });

  next();
});

// Register API routes
registerRoutes(app);

// Error handler suitable for serverless
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err?.status || err?.statusCode || 500;
  const message = err?.message || "Internal Server Error";
  try {
    console.error(`error ${status}: ${message}`);
  } catch {}
  res.status(status).json({ message });
});

export default app;

