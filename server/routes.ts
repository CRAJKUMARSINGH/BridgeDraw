import type { Express } from "express";
import { storage } from "./storage";
import { 
  batchUploadSchema, 
  bridgeInputSchema, 
  insertBridgeProjectSchema,
  insertBridgeParametersSchema,
  insertBridgeCrossSectionSchema,
  type BatchUpload,
  type BridgeInput 
} from "../shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<void> {
  // Existing bridge project routes
  app.get("/api/bridge/projects", async (req, res) => {
    try {
      // For now, return all projects. In a real app, filter by user
      const projects = await storage.getUserBridgeProjects("dummy-user");
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.post("/api/bridge/projects", async (req, res) => {
    try {
      const data = insertBridgeProjectSchema.parse(req.body);
      const project = await storage.createBridgeProject(data);
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  // New batch processing routes
  app.post("/api/bridge/batch-upload", async (req, res) => {
    try {
      const data = batchUploadSchema.parse(req.body);
      
      // Create batch job
      const batchJob = await storage.createBatchJob({
        name: `Batch Job ${new Date().toISOString()}`,
        status: "pending",
        totalFiles: data.files.length,
        processedFiles: 0,
        failedFiles: 0,
        userId: "dummy-user" // In real app, get from session
      });

      // Process each file and create batch job files
      const jobFiles = [];
      for (const file of data.files) {
        try {
          // Parse and validate bridge input data
          const parsedData = parseBridgeInputFile(file.content);
          const validatedData = bridgeInputSchema.parse(parsedData);
          
          // Create bridge project
          const project = await storage.createBridgeProject({
            name: file.name.replace('.txt', ''),
            inputData: file.content,
            parameters: JSON.stringify(validatedData)
          });

          // Create batch job file entry
          const jobFile = await storage.createBatchJobFile({
            fileName: file.name,
            fileSize: file.size,
            status: "pending",
            progress: 0,
            currentStep: "Queued for processing",
            estimatedTime: 180, // 3 minutes estimate
            batchJobId: batchJob.id,
            projectId: project.id
          });

          jobFiles.push(jobFile);

        } catch (error) {
          // Create failed job file entry
          const jobFile = await storage.createBatchJobFile({
            fileName: file.name,
            fileSize: file.size,
            status: "failed",
            progress: 0,
            currentStep: "Validation failed",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
            batchJobId: batchJob.id
          });

          await storage.updateBatchJob(batchJob.id, {
            failedFiles: batchJob.failedFiles + 1
          });

          jobFiles.push(jobFile);
        }
      }

      // Start processing queue (in real app, this would be async)
      // Immediately set job status to processing to avoid race with manual trigger
      await storage.updateBatchJob(batchJob.id, { status: "processing" });
      processBatchJobAsync(batchJob.id);

      res.json({
        batchJob,
        jobFiles,
        success: true
      });

    } catch (error) {
      console.error("Batch upload error:", error);
      res.status(400).json({ error: "Invalid batch upload data" });
    }
  });

  app.get("/api/bridge/batch-jobs", async (req, res) => {
    try {
      const jobs = await storage.getUserBatchJobs("dummy-user");
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch batch jobs" });
    }
  });

  app.get("/api/bridge/batch-jobs/:id", async (req, res) => {
    try {
      const job = await storage.getBatchJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Batch job not found" });
      }
      const files = await storage.getBatchJobFiles(job.id);
      res.json({ job, files });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch batch job" });
    }
  });

  app.post("/api/bridge/batch-jobs/:id/process", async (req, res) => {
    try {
      const job = await storage.getBatchJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Batch job not found" });
      }

      if (job.status !== "pending") {
        return res.status(400).json({ error: "Job is not in pending status" });
      }

      // Update job status
      await storage.updateBatchJob(job.id, { status: "processing" });
      
      // Start processing
      processBatchJobAsync(job.id);

      res.json({ success: true, message: "Batch processing started" });
    } catch (error) {
      res.status(500).json({ error: "Failed to start batch processing" });
    }
  });

  app.get("/api/bridge/batch-jobs/:id/export", async (req, res) => {
    try {
      const job = await storage.getBatchJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Batch job not found" });
      }

      const files = await storage.getBatchJobFiles(job.id);
      const completedFiles = files.filter(f => f.status === "completed");

      // In a real implementation, this would generate actual files
      const exportData = {
        jobId: job.id,
        jobName: job.name,
        totalFiles: completedFiles.length,
        formats: {
          dwg: completedFiles.length,
          pdf: completedFiles.length,
          lisp: completedFiles.length
        },
        downloadUrl: `/api/bridge/download/${job.id}`,
        totalSize: completedFiles.reduce((sum, f) => sum + f.fileSize, 0) * 3 // 3 formats
      };

      res.json(exportData);
    } catch (error) {
      res.status(500).json({ error: "Failed to prepare export" });
    }
  });

  return;
}

// Helper function to parse bridge input file
function parseBridgeInputFile(content: string): BridgeInput {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines.length < 10) {
    throw new Error("Invalid file format: insufficient data");
  }

  try {
    const scale1 = parseFloat(lines[0]);
    const scale2 = parseFloat(lines[1]);
    const skew = parseFloat(lines[2]);
    const datum = parseFloat(lines[3]);
    const toprl = parseFloat(lines[4]);
    const left = parseFloat(lines[5]);
    const right = parseFloat(lines[6]);
    const xincr = parseFloat(lines[7]);
    const yincr = parseFloat(lines[8]);
    const noch = parseInt(lines[9]);

    const crossSections = [];
    for (let i = 10; i < lines.length; i += 2) {
      if (i + 1 < lines.length) {
        crossSections.push({
          chainage: parseFloat(lines[i]),
          level: parseFloat(lines[i + 1])
        });
      }
    }

    return {
      scale1,
      scale2,
      skew,
      datum,
      toprl,
      left,
      right,
      xincr,
      yincr,
      noch,
      crossSections
    };
  } catch (error) {
    throw new Error("Invalid file format: failed to parse numeric values");
  }
}

// Async processing simulation (in real app, this would use a proper job queue)
async function processBatchJobAsync(jobId: string) {
  const job = await storage.getBatchJob(jobId);
  if (!job) return;

  const files = await storage.getBatchJobFiles(jobId);
  const pendingFiles = files.filter(f => f.status === "pending");

  for (const file of pendingFiles) {
    try {
      // Update to processing
      await storage.updateBatchJobFile(file.id, {
        status: "processing",
        progress: 0,
        currentStep: "Parsing bridge parameters",
        startedAt: new Date().toISOString()
      });

      // Simulate processing steps
      const steps = [
        { step: "Parsing bridge parameters", progress: 20, delay: 1000 },
        { step: "Calculating coordinates", progress: 40, delay: 1500 },
        { step: "Generating plan view", progress: 60, delay: 2000 },
        { step: "Generating elevation views", progress: 80, delay: 1500 },
        { step: "Exporting files", progress: 100, delay: 1000 }
      ];

      for (const { step, progress, delay } of steps) {
        await new Promise(resolve => setTimeout(resolve, delay));
        await storage.updateBatchJobFile(file.id, {
          currentStep: step,
          progress
        });
      }

      // Mark as completed
      await storage.updateBatchJobFile(file.id, {
        status: "completed",
        progress: 100,
        currentStep: "Generation completed",
        completedAt: new Date().toISOString()
      });

      // Update job progress
      const updatedFiles = await storage.getBatchJobFiles(jobId);
      const processedCount = updatedFiles.filter(f => f.status === "completed" || f.status === "failed").length;
      
      await storage.updateBatchJob(jobId, {
        processedFiles: processedCount
      });

    } catch (error) {
      // Mark as failed
      await storage.updateBatchJobFile(file.id, {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        completedAt: new Date().toISOString()
      });

      const updatedJob = await storage.getBatchJob(jobId);
      if (updatedJob) {
        await storage.updateBatchJob(jobId, {
          failedFiles: updatedJob.failedFiles + 1
        });
      }
    }
  }

  // Mark job as completed
  const finalFiles = await storage.getBatchJobFiles(jobId);
  const allCompleted = finalFiles.every(f => f.status === "completed" || f.status === "failed");
  
  if (allCompleted) {
    await storage.updateBatchJob(jobId, {
      status: "completed",
      completedAt: new Date().toISOString()
    });
  }
}
