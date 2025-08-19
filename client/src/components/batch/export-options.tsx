import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";

interface ExportConfig {
  archiveFormat: "zip" | "tar" | "individual";
  namingConvention: "original" | "sequential" | "timestamp";
  includeParameters: boolean;
}

export default function ExportOptions() {
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    archiveFormat: "zip",
    namingConvention: "original",
    includeParameters: true,
  });
  const [selectedFormats, setSelectedFormats] = useState<Set<string>>(new Set(["dwg", "pdf", "lisp"]));
  
  const { toast } = useToast();

  const { data: batchJobs = [] } = useQuery({
    queryKey: ["/api/bridge/batch-jobs"],
  });

  const exportMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return apiRequest(`/api/bridge/batch-jobs/${jobId}/export`, "GET");
    },
    onSuccess: (data) => {
      toast({
        title: "Export Prepared",
        description: `${data.totalFiles} files ready for download`,
      });
      // In a real app, this would trigger the actual download
      window.open(data.downloadUrl, '_blank');
    },
    onError: (error) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to prepare export",
        variant: "destructive",
      });
    },
  });

  const completedJobs = batchJobs.filter((job: any) => job.status === "completed");
  const totalCompletedFiles = completedJobs.reduce((sum: number, job: any) => sum + job.processedFiles, 0);

  const handleFormatToggle = (format: string) => {
    const newFormats = new Set(selectedFormats);
    if (newFormats.has(format)) {
      newFormats.delete(format);
    } else {
      newFormats.add(format);
    }
    setSelectedFormats(newFormats);
  };

  const handleBatchExport = () => {
    if (completedJobs.length === 0) {
      toast({
        title: "No Completed Jobs",
        description: "Complete some batch jobs before exporting",
        variant: "destructive",
      });
      return;
    }

    // For demo, export the first completed job
    exportMutation.mutate(completedJobs[0].id);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-download text-green-600"></i>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Batch Export Options</h2>
              <p className="text-sm text-gray-500">Download all generated files in bulk</p>
            </div>
          </div>
          <Badge variant="secondary">Step 3</Badge>
        </div>

        {/* Export Format Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedFormats.has("dwg") ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary"
            }`}
            onClick={() => handleFormatToggle("dwg")}
            data-testid="format-dwg"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-file-code text-orange-600 text-lg"></i>
              </div>
              <h4 className="font-semibold text-gray-900">DWG Format</h4>
              <p className="text-sm text-gray-600 mt-1">AutoCAD Drawing Files</p>
              <p className="text-xs text-gray-500 mt-2">3 A4 Landscape Pages each</p>
              <div className="mt-3 text-sm">
                <span className="font-medium text-green-600">{totalCompletedFiles}</span> files ready
              </div>
            </div>
          </div>
          
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedFormats.has("pdf") ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary"
            }`}
            onClick={() => handleFormatToggle("pdf")}
            data-testid="format-pdf"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-file-pdf text-red-600 text-lg"></i>
              </div>
              <h4 className="font-semibold text-gray-900">PDF Format</h4>
              <p className="text-sm text-gray-600 mt-1">Portable Documents</p>
              <p className="text-xs text-gray-500 mt-2">Print Ready A4</p>
              <div className="mt-3 text-sm">
                <span className="font-medium text-green-600">{totalCompletedFiles}</span> files ready
              </div>
            </div>
          </div>
          
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedFormats.has("lisp") ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary"
            }`}
            onClick={() => handleFormatToggle("lisp")}
            data-testid="format-lisp"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-code text-green-600 text-lg"></i>
              </div>
              <h4 className="font-semibold text-gray-900">LISP Code</h4>
              <p className="text-sm text-gray-600 mt-1">AutoCAD LISP Scripts</p>
              <p className="text-xs text-gray-500 mt-2">Generated Commands</p>
              <div className="mt-3 text-sm">
                <span className="font-medium text-green-600">{totalCompletedFiles}</span> files ready
              </div>
            </div>
          </div>
        </div>

        {/* Export Configuration */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Export Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Archive Format</label>
              <Select
                value={exportConfig.archiveFormat}
                onValueChange={(value: "zip" | "tar" | "individual") =>
                  setExportConfig(prev => ({ ...prev, archiveFormat: value }))
                }
              >
                <SelectTrigger data-testid="select-archive-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zip">ZIP Archive</SelectItem>
                  <SelectItem value="tar">TAR Archive</SelectItem>
                  <SelectItem value="individual">Individual Files</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Naming Convention</label>
              <Select
                value={exportConfig.namingConvention}
                onValueChange={(value: "original" | "sequential" | "timestamp") =>
                  setExportConfig(prev => ({ ...prev, namingConvention: value }))
                }
              >
                <SelectTrigger data-testid="select-naming-convention">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">Original Filename</SelectItem>
                  <SelectItem value="sequential">Sequential (bridge_001, 002...)</SelectItem>
                  <SelectItem value="timestamp">With Timestamp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-parameters"
                checked={exportConfig.includeParameters}
                onCheckedChange={(checked) =>
                  setExportConfig(prev => ({ ...prev, includeParameters: !!checked }))
                }
                data-testid="checkbox-include-parameters"
              />
              <label htmlFor="include-parameters" className="text-sm text-gray-700">
                Include parameter files (.txt)
              </label>
            </div>
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Total files: <span className="font-medium" data-testid="text-total-files">
              {totalCompletedFiles * selectedFormats.size}
            </span>
            {totalCompletedFiles > 0 && (
              <span> ({totalCompletedFiles} projects × {selectedFormats.size} formats)</span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              data-testid="button-preview-export"
            >
              <i className="fas fa-eye mr-2"></i>
              Preview
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleBatchExport}
              disabled={completedJobs.length === 0 || selectedFormats.size === 0 || exportMutation.isPending}
              data-testid="button-download-all"
            >
              <i className="fas fa-download mr-2"></i>
              {exportMutation.isPending ? "Preparing..." : "Download All"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
