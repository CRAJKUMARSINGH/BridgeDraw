import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const bridgeProjects = pgTable("bridge_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  userId: varchar("user_id").references(() => users.id),
  inputData: text("input_data").notNull(),
  parameters: text("parameters").notNull(), // JSON string of bridge parameters
  generatedDrawing: text("generated_drawing"), // SVG or drawing data
  createdAt: text("created_at").default(sql`now()`),
});

export const bridgeParameters = pgTable("bridge_parameters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => bridgeProjects.id),
  scale1: real("scale1").notNull(), // scale for plan and elevation
  scale2: real("scale2").notNull(), // scale for sections
  skew: real("skew").notNull(), // skew angle in degrees
  datum: real("datum").notNull(), // datum level
  toprl: real("toprl").notNull(), // top level on Y axis
  left: real("left").notNull(), // start chainage of X axis
  right: real("right").notNull(), // end chainage of X axis
  xincr: real("xincr").notNull(), // interval of distances on X axis
  yincr: real("yincr").notNull(), // interval of levels on Y axis
  noch: integer("noch").notNull(), // total number of chainages
});

export const bridgeCrossSections = pgTable("bridge_cross_sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => bridgeProjects.id),
  chainage: real("chainage").notNull(),
  level: real("level").notNull(),
  sequence: integer("sequence").notNull(),
});

// New batch processing tables
export const batchJobs = pgTable("batch_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  totalFiles: integer("total_files").notNull(),
  processedFiles: integer("processed_files").notNull().default(0),
  failedFiles: integer("failed_files").notNull().default(0),
  createdAt: text("created_at").default(sql`now()`),
  completedAt: text("completed_at"),
});

export const batchJobFiles = pgTable("batch_job_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchJobId: varchar("batch_job_id").references(() => batchJobs.id),
  projectId: varchar("project_id").references(() => bridgeProjects.id),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  progress: integer("progress").notNull().default(0),
  errorMessage: text("error_message"),
  currentStep: text("current_step"),
  estimatedTime: integer("estimated_time_seconds"),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBridgeProjectSchema = createInsertSchema(bridgeProjects).pick({
  name: true,
  inputData: true,
  parameters: true,
});

export const insertBridgeParametersSchema = createInsertSchema(bridgeParameters).omit({
  id: true,
  projectId: true,
});

export const insertBridgeCrossSectionSchema = createInsertSchema(bridgeCrossSections).omit({
  id: true,
  projectId: true,
});

export const insertBatchJobSchema = createInsertSchema(batchJobs).omit({
  id: true,
  userId: true,
  createdAt: true,
  completedAt: true,
});

export const insertBatchJobFileSchema = createInsertSchema(batchJobFiles).omit({
  id: true,
  batchJobId: true,
  startedAt: true,
  completedAt: true,
});

// Input file parsing schema
export const bridgeInputSchema = z.object({
  scale1: z.number().positive(),
  scale2: z.number().positive(),
  skew: z.number(),
  datum: z.number(),
  toprl: z.number(),
  left: z.number(),
  right: z.number(),
  xincr: z.number().positive(),
  yincr: z.number().positive(),
  noch: z.number().int().positive(),
  crossSections: z.array(z.object({
    chainage: z.number(),
    level: z.number()
  })).optional()
});

export const batchUploadSchema = z.object({
  files: z.array(z.object({
    name: z.string(),
    content: z.string(),
    size: z.number()
  })).min(1).max(20)
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBridgeProject = z.infer<typeof insertBridgeProjectSchema>;
export type BridgeProject = typeof bridgeProjects.$inferSelect;
export type InsertBridgeParameters = z.infer<typeof insertBridgeParametersSchema>;
export type BridgeParameters = typeof bridgeParameters.$inferSelect;
export type InsertBridgeCrossSection = z.infer<typeof insertBridgeCrossSectionSchema>;
export type BridgeCrossSection = typeof bridgeCrossSections.$inferSelect;
export type BridgeInput = z.infer<typeof bridgeInputSchema>;
export type InsertBatchJob = z.infer<typeof insertBatchJobSchema>;
export type BatchJob = typeof batchJobs.$inferSelect;
export type InsertBatchJobFile = z.infer<typeof insertBatchJobFileSchema>;
export type BatchJobFile = typeof batchJobFiles.$inferSelect;
export type BatchUpload = z.infer<typeof batchUploadSchema>;
