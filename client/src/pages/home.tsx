import { useState } from "react";
import FileUpload from "@/components/batch/file-upload";
import ProcessingQueue from "@/components/batch/processing-queue";
import ExportOptions from "@/components/batch/export-options";
import ParameterDisplay from "@/components/batch/parameter-display";

export default function Home() {
  const [selectedBatchJob, setSelectedBatchJob] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-bridge text-white text-sm"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Bridge GAD Drafter</h1>
                <p className="text-xs text-gray-500">Batch Processing System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600" data-testid="button-settings">
                <i className="fas fa-cog"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: File Management */}
          <div className="lg:col-span-2 space-y-6">
            <FileUpload onBatchJobCreated={setSelectedBatchJob} />
            <ProcessingQueue selectedJobId={selectedBatchJob} />
            <ExportOptions />
          </div>

          {/* Right Column: Parameter Display & Controls */}
          <div className="space-y-6">
            <ParameterDisplay />
          </div>
        </div>
      </div>
    </div>
  );
}
