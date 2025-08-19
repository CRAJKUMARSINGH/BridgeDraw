import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BridgeParameters {
  scale1: string;
  scale2: string;
  skew: string;
  datum: string;
  toprl: string;
  chainageRange: string;
  xincr: string;
  yincr: string;
  noch: string;
}

interface CalculatedConstants {
  vvs: string;
  hhs: string;
  skew1: string;
  sc: string;
}

export default function ParameterDisplay() {
  // Sample parameters - in a real app, these would come from the selected project
  const [parameters] = useState<BridgeParameters>({
    scale1: "1:100",
    scale2: "1:50", 
    skew: "15.0°",
    datum: "120.500m",
    toprl: "125.750m",
    chainageRange: "2+150 to 2+200",
    xincr: "5.0m",
    yincr: "1.0m",
    noch: "11"
  });

  const [constants] = useState<CalculatedConstants>({
    vvs: "1000.0",
    hhs: "1000.0", 
    skew1: "0.2618",
    sc: "2.00"
  });

  const handleEditParameters = () => {
    // In a real app, this would open an edit dialog
    console.log("Edit parameters clicked");
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <i className="fas fa-calculator text-primary mr-2"></i>
            Current Project Parameters
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditParameters}
            data-testid="button-edit-parameters"
          >
            <i className="fas fa-edit mr-1"></i>Edit
          </Button>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-medium">Scale 1 (Plan/Elevation):</span>
            <span className="font-mono text-gray-700" data-testid="param-scale1">{parameters.scale1}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-medium">Scale 2 (Sections):</span>
            <span className="font-mono text-gray-700" data-testid="param-scale2">{parameters.scale2}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-medium">Skew Angle:</span>
            <span className="font-mono text-gray-700" data-testid="param-skew">{parameters.skew}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-medium">Datum Level:</span>
            <span className="font-mono text-gray-700" data-testid="param-datum">{parameters.datum}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-medium">Top RL:</span>
            <span className="font-mono text-gray-700" data-testid="param-toprl">{parameters.toprl}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-medium">Chainage Range:</span>
            <span className="font-mono text-gray-700" data-testid="param-chainage-range">{parameters.chainageRange}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-medium">X Increment:</span>
            <span className="font-mono text-gray-700" data-testid="param-xincr">{parameters.xincr}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-medium">Y Increment:</span>
            <span className="font-mono text-gray-700" data-testid="param-yincr">{parameters.yincr}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-medium">No. of Chainages:</span>
            <span className="font-mono text-gray-700" data-testid="param-noch">{parameters.noch}</span>
          </div>
        </div>

        {/* Calculated Constants (Educational) */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-3">Calculated Constants (Educational)</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-blue-700">vvs (V scale factor):</span>
              <span className="font-mono text-blue-900" data-testid="constant-vvs">{constants.vvs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">hhs (H scale factor):</span>
              <span className="font-mono text-blue-900" data-testid="constant-hhs">{constants.hhs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">skew1 (radians):</span>
              <span className="font-mono text-blue-900" data-testid="constant-skew1">{constants.skew1}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">sc (scale ratio):</span>
              <span className="font-mono text-blue-900" data-testid="constant-sc">{constants.sc}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
