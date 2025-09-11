import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../server/app";

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Delegate to Express app for all /api/* routes
  return (app as any)(req, res);
}

