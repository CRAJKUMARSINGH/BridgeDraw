export interface BatchUpload {
  files: {
    name: string;
    content: string;
    size: number;
  }[];
}

export interface BatchJob {
  id: string;
  userId: string;
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  totalFiles: number;
  processedFiles: number;
  failedFiles: number;
  createdAt: string;
  completedAt: string | null;
}

export interface BatchJobFile {
  id: string;
  batchJobId: string;
  projectId?: string;
  fileName: string;
  fileSize: number;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  errorMessage?: string;
  currentStep?: string;
  estimatedTime?: number;
  startedAt?: string;
  completedAt?: string;
}

export interface BridgeProject {
  id: string;
  name: string;
  userId: string | null;
  inputData: string;
  parameters: string;
  generatedDrawing: string | null;
  createdAt: string;
}

export interface BridgeParameters {
  id: string;
  projectId: string;
  scale1: number;
  scale2: number;
  skew: number;
  datum: number;
  toprl: number;
  left: number;
  right: number;
  xincr: number;
  yincr: number;
  noch: number;
}

export interface BridgeCrossSection {
  id: string;
  projectId: string;
  chainage: number;
  level: number;
  sequence: number;
}

export interface User {
  id: string;
  username: string;
  password: string;
}
