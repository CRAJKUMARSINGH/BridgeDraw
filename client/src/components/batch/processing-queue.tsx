import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import type { BatchJob, BatchJobFile } from "@/types";

interface ProcessingQueueProps {
  selectedJobId?: string | null;
}

export default function ProcessingQueue({ selectedJobId }: ProcessingQueueProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: batchJobs = [], isLoading } = useQuery({
    queryKey: ["/api/bridge/batch-jobs"],
    refetchInterval: 2000, // Poll every 2 seconds for updates
  });

  const { data: selectedJobData } = useQuery({
    queryKey: ["/api/bridge/batch-jobs", selectedJobId],
    enabled: !!selectedJobId,
    refetchInterval: 1000, // More frequent updates for selected job
  });

  const processMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return apiRequest(`/api/bridge/batch-jobs/${jobId}/process`, "POST");
    },
    onSuccess: () => {
      toast({
        title: "Processing Started",
        description: "Batch processing has been initiated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bridge/batch-jobs"] });
    },
    onError: (error) => {
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to start processing",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-blue-50 text-blue-600";
      case "processing": return "bg-orange-50 text-orange-600";
      case "completed": return "bg-green-50 text-green-600";
      case "failed": return "bg-red-50 text-red-600";
      default: return "bg-gray-50 text-gray-600";
    }
  };

  const getQueueStats = () => {
    const stats = { pending: 0, processing: 0, completed: 0, failed: 0 };
    
    batchJobs.forEach((job: BatchJob) => {
      if (job.status in stats) {
        stats[job.status as keyof typeof stats]++;
      }
    });

    return stats;
  };

  const queueStats = getQueueStats();
  const processingFiles = selectedJobData?.files?.filter(
    (file: BatchJobFile) => file.status === "processing" || file.status === "completed"
  ) || [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-3">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-tasks text-orange-600"></i>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Batch Processing Queue</h2>
              <p className="text-sm text-gray-500">Monitor and manage multiple bridge generations</p>
            </div>
          </div>
          <Badge variant="secondary">Step 2</Badge>
        </div>

        {/* Queue Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600" data-testid="stat-pending">
              {queueStats.pending}
            </div>
            <div className="text-sm text-blue-600">Pending</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600" data-testid="stat-processing">
              {queueStats.processing}
            </div>
            <div className="text-sm text-orange-600">Processing</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600" data-testid="stat-completed">
              {queueStats.completed}
            </div>
            <div className="text-sm text-green-600">Completed</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600" data-testid="stat-failed">
              {queueStats.failed}
            </div>
            <div className="text-sm text-red-600">Failed</div>
          </div>
        </div>

        {/* Individual Job Progress */}
        <div className="space-y-3" data-testid="processing-jobs">
          {processingFiles.map((file: BatchJobFile) => (
            <div key={file.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStatusColor(file.status)}`}>
                    {file.status === "processing" ? (
                      <i className="fas fa-cog fa-spin text-sm"></i>
                    ) : file.status === "completed" ? (
                      <i className="fas fa-check text-sm"></i>
                    ) : (
                      <i className="fas fa-clock text-sm"></i>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{file.fileName}</p>
                    <p className="text-sm text-gray-500">{file.currentStep || "Queued"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{file.progress}%</span>
                  <Badge
                    className={
                      file.status === "processing" ? "bg-orange-100 text-orange-800" :
                      file.status === "completed" ? "bg-green-100 text-green-800" :
                      "bg-blue-100 text-blue-800"
                    }
                  >
                    {file.status === "processing" ? "Processing" :
                     file.status === "completed" ? "Completed" : "Pending"}
                  </Badge>
                </div>
              </div>
              
              <Progress value={file.progress} className="mb-2" />
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {file.status === "completed" && file.completedAt ? (
                    `Completed ${new Date(file.completedAt).toLocaleTimeString()}`
                  ) : file.estimatedTime ? (
                    `Estimated completion: ${Math.round(file.estimatedTime / 60)} minutes`
                  ) : (
                    "Processing..."
                  )}
                </div>
                {file.status === "completed" && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid={`button-view-${file.id}`}
                    >
                      <i className="fas fa-eye mr-1"></i>View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid={`button-download-${file.id}`}
                    >
                      <i className="fas fa-download mr-1"></i>Download
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {processingFiles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-clipboard-list text-3xl mb-4"></i>
              <p>No jobs in processing queue</p>
              <p className="text-sm">Upload files to start batch processing</p>
            </div>
          )}
        </div>

        {/* Queue Controls */}
        {batchJobs.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Queue processing: <span className="font-medium text-green-600">Active</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                data-testid="button-pause-queue"
              >
                <i className="fas fa-pause mr-2"></i>
                Pause Queue
              </Button>
              <Button
                variant="outline"
                size="sm"
                data-testid="button-clear-completed"
              >
                <i className="fas fa-trash mr-2"></i>
                Clear Completed
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
