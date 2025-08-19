import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import * as XLSX from "xlsx";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Get project by ID
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Create project
  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Update project
  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const updates = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, updates);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // Delete project
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const success = await storage.deleteProject(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Parse Excel file
  app.post("/api/parse-excel", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }

      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Parse engineering data from Excel
      const parsedData = parseEngineeringData(data as any[][]);
      
      res.json(parsedData);
    } catch (error) {
      res.status(500).json({ message: "Failed to parse Excel file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function parseEngineeringData(data: any[][]): any {
  // Implementation based on the LISP code structure
  // This parses the Excel data in the same order as the LISP read functions
  
  let rowIndex = 0;
  const result: any = {};

  try {
    // Read scale parameters
    result.scale1 = parseFloat(data[rowIndex++]?.[0]) || 100;
    result.scale2 = parseFloat(data[rowIndex++]?.[0]) || 50;
    result.skew = parseFloat(data[rowIndex++]?.[0]) || 0;
    result.datum = parseInt(data[rowIndex++]?.[0]) || 100;
    result.toprl = parseInt(data[rowIndex++]?.[0]) || 105;
    result.left = parseFloat(data[rowIndex++]?.[0]) || 0;
    result.right = parseFloat(data[rowIndex++]?.[0]) || 50;
    result.xincr = parseFloat(data[rowIndex++]?.[0]) || 5;
    result.yincr = parseFloat(data[rowIndex++]?.[0]) || 1;
    result.noch = parseInt(data[rowIndex++]?.[0]) || 11;

    // Read cross-section data
    result.crossSections = [];
    for (let i = 0; i < result.noch && rowIndex < data.length - 1; i++) {
      const x = parseFloat(data[rowIndex++]?.[0]) || 0;
      const y = parseFloat(data[rowIndex++]?.[0]) || 0;
      result.crossSections.push({ chainage: x, level: y });
    }

    // Calculate derived values (from LISP calculations)
    result.hs = 1;
    result.vs = 1;
    result.vvs = 1000.0 / result.vs;
    result.hhs = 1000.0 / result.hs;
    result.skew1 = result.skew * 0.0174532; // Convert to radians
    result.s = Math.sin(result.skew1);
    result.c = Math.cos(result.skew1);
    result.tn = result.s / result.c;
    result.sc = result.scale1 / result.scale2;

    return result;
  } catch (error) {
    throw new Error("Invalid Excel data format");
  }
}
