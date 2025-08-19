import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import type { BatchUpload } from "@/types";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  content: string;
  status: "pending" | "validated" | "error";
  errorMessage?: string;
}

interface FileUploadProps {
  onBatchJobCreated?: (jobId: string) => void;
}

export default function FileUpload({ onBatchJobCreated }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const batchUploadMutation = useMutation({
    mutationFn: async (data: BatchUpload) => {
      return apiRequest("/api/bridge/batch-upload", "POST", data);
    },
    onSuccess: (response) => {
      toast({
        title: "Batch Upload Successful",
        description: `Successfully uploaded ${response.jobFiles.length} files for processing.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bridge/batch-jobs"] });
      if (onBatchJobCreated && response.batchJob) {
        onBatchJobCreated(response.batchJob.id);
      }
      setUploadedFiles([]);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload files",
        variant: "destructive",
      });
    },
  });

  const validateFile = useCallback((content: string): { valid: boolean; error?: string } => {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length < 10) {
      return { valid: false, error: "Invalid format: insufficient data" };
    }

    try {
      // Validate that first 10 lines are numeric
      for (let i = 0; i < 10; i++) {
        const num = parseFloat(lines[i]);
        if (isNaN(num)) {
          return { valid: false, error: `Invalid numeric value at line ${i + 1}` };
        }
      }
      return { valid: true };
    } catch (error) {
      return { valid: false, error: "Failed to parse file content" };
    }
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length + uploadedFiles.length > 20) {
        toast({
          title: "Too Many Files",
          description: "Maximum 20 files allowed per batch",
          variant: "destructive",
        });
        return;
      }

      acceptedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const content = reader.result as string;
          const validation = validateFile(content);
          
          const uploadedFile: UploadedFile = {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            content,
            status: validation.valid ? "validated" : "error",
            errorMessage: validation.error,
          };

          setUploadedFiles(prev => [...prev, uploadedFile]);
        };
        reader.readAsText(file);
      });
    },
    [uploadedFiles.length, validateFile, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
    },
    multiple: true,
    maxFiles: 20,
  });

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    setUploadedFiles([]);
  };

  const handleStartBatchProcessing = () => {
    const validFiles = uploadedFiles.filter(f => f.status === "validated");
    
    if (validFiles.length === 0) {
      toast({
        title: "No Valid Files",
        description: "Please upload valid GAD files before processing",
        variant: "destructive",
      });
      return;
    }

    const batchData: BatchUpload = {
      files: validFiles.map(f => ({
        name: f.name,
        content: f.content,
        size: f.size
      }))
    };

    batchUploadMutation.mutate(batchData);
  };

  const validFiles = uploadedFiles.filter(f => f.status === "validated");

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <i className="fas fa-cloud-upload-alt text-primary"></i>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Upload GAD Files</h2>
              <p className="text-sm text-gray-500">Batch processing for multiple bridge designs</p>
            </div>
          </div>
          <Badge variant="secondary">Step 1</Badge>
        </div>

        {/* Enhanced Drop Zone for Multiple Files */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
          }`}
          data-testid="dropzone-upload"
        >
          <input {...getInputProps()} data-testid="input-file" />
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="fas fa-files text-gray-400 text-xl"></i>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">Upload Multiple GAD.txt Files</p>
              <p className="text-sm text-gray-500 mt-1">
                Click to browse or drag and drop multiple bridge parameter files
              </p>
            </div>
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
              <span>Supported: .txt files</span>
              <span>Max: 10MB each</span>
              <span>Batch limit: 20 files</span>
            </div>
          </div>
        </div>

        {/* File Queue Display */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6 space-y-3" data-testid="file-queue">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      file.status === "validated" ? "bg-blue-100" : 
                      file.status === "error" ? "bg-orange-100" : "bg-gray-100"
                    }`}>
                      <i className={`text-sm ${
                        file.status === "validated" ? "fas fa-file-alt text-blue-600" : 
                        file.status === "error" ? "fas fa-file-alt text-orange-600" : "fas fa-file-alt text-gray-600"
                      }`}></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB • {
                          file.status === "validated" ? "Ready for processing" :
                          file.status === "error" ? file.errorMessage : "Processing..."
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={file.status === "validated" ? "default" : "destructive"}
                      className={
                        file.status === "validated" ? "bg-green-100 text-green-800" : ""
                      }
                    >
                      {file.status === "validated" && <i className="fas fa-check-circle mr-1"></i>}
                      {file.status === "error" && <i className="fas fa-exclamation-triangle mr-1"></i>}
                      {file.status === "validated" ? "Validated" : 
                       file.status === "error" ? "Invalid Format" : "Processing"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      data-testid={`button-remove-file-${file.id}`}
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Batch Action Buttons */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{validFiles.length}</span> of{" "}
              <span>{uploadedFiles.length}</span> files ready
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={clearAll}
                data-testid="button-clear-all"
              >
                Clear All
              </Button>
              <Button
                onClick={handleStartBatchProcessing}
                disabled={validFiles.length === 0 || batchUploadMutation.isPending}
                data-testid="button-start-batch-processing"
              >
                <i className="fas fa-play mr-2"></i>
                {batchUploadMutation.isPending ? "Processing..." : "Start Batch Processing"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
