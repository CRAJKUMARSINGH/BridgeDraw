import express from "express";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { attachRoutes } from "../server/routes";

// Create an Express app per request (sufficient for lightweight APIs)
export default function handler(req: VercelRequest, res: VercelResponse) {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  attachRoutes(app);

  // Let Express handle the request using the Node adapter
  // We forward the request to the Express app by calling app.handle
  // Vercel provides Node.js req/res compatible objects
  app(req as any, res as any);
}

