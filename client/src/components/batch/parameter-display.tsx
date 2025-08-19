import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Real parameters based on the Excel data provided
interface BridgeParameters {
  scale1: string;
  ablen: string;
  dirth: string;
  alcw: string;
  alfl: string;
  arfl: string;
  alcd: string;
  alfb: string;
  allfbl: string;
  alfrb: string;
  altb: string;
  altfl: string;
  altbr: string;
  alfo: string;
  alfd: string;
  albb: string;
  albbl: string;
  albbr: string;
  scale2: string;
  skew: string;
  datum: string;
  toprl: string;
  left: string;
  right: string;
  xincr: string;
  yincr: string;
  noch: string;
  nspan: string;
  lbridge: string;
  abtl: string;
}

export default function ParameterDisplay() {
  // Parameters matching the Excel image data
  const [parameters] = useState<BridgeParameters>({
    scale1: "186",
    ablen: "12.00",
    dirth: "0.30", 
    alcw: "0.75",
    alfl: "100.00",
    arfl: "100.75",
    alcd: "1.20",
    alfb: "10.00",
    allfbl: "101.00",
    alfrb: "100.75", 
    altb: "10.00",
    altfl: "101.00",
    altbr: "100.75",
    alfo: "1.50",
    alfd: "1.00",
    albb: "3.00",
    albbl: "101.00",
    albbr: "100.75",
    scale2: "100",
    skew: "0.00",
    datum: "100.00",
    toprl: "110.98",
    left: "0.00",
    right: "43.20",
    xincr: "10.00",
    yincr: "1.00",
    noch: "4",
    nspan: "4",
    lbridge: "43.20",
    abtl: "0.00"
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
            <i className="fas fa-bridge text-primary mr-2"></i>
            Bridge GAD Parameters
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
        
        <div className="space-y-2 text-sm max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h5 className="font-medium text-gray-800 border-b">Basic Parameters</h5>
              <div className="flex justify-between">
                <span className="text-gray-600">SCALE1:</span>
                <span className="font-mono text-gray-900">{parameters.scale1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ABLEN:</span>
                <span className="font-mono text-gray-900">{parameters.ablen}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">DIRTH:</span>
                <span className="font-mono text-gray-900">{parameters.dirth}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ALCW:</span>
                <span className="font-mono text-gray-900">{parameters.alcw}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ALFL:</span>
                <span className="font-mono text-gray-900">{parameters.alfl}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ARFL:</span>
                <span className="font-mono text-gray-900">{parameters.arfl}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ALCD:</span>
                <span className="font-mono text-gray-900">{parameters.alcd}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ALFB:</span>
                <span className="font-mono text-gray-900">{parameters.alfb}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ALLFBL:</span>
                <span className="font-mono text-gray-900">{parameters.allfbl}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ALFRB:</span>
                <span className="font-mono text-gray-900">{parameters.alfrb}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ALTB:</span>
                <span className="font-mono text-gray-900">{parameters.altb}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ALTFL:</span>
                <span className="font-mono text-gray-900">{parameters.altfl}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ALTBR:</span>
                <span className="font-mono text-gray-900">{parameters.altbr}m</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-medium text-gray-800 border-b">Layout Parameters</h5>
              <div className="flex justify-between">
                <span className="text-gray-600">ALFO:</span>
                <span className="font-mono text-gray-900">{parameters.alfo}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ALFD:</span>
                <span className="font-mono text-gray-900">{parameters.alfd}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ALBB:</span>
                <span className="font-mono text-gray-900">{parameters.albb}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SCALE2:</span>
                <span className="font-mono text-gray-900">{parameters.scale2}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SKEW:</span>
                <span className="font-mono text-gray-900">{parameters.skew}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">DATUM:</span>
                <span className="font-mono text-gray-900">{parameters.datum}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">TOPRL:</span>
                <span className="font-mono text-gray-900">{parameters.toprl}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">LEFT:</span>
                <span className="font-mono text-gray-900">{parameters.left}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">RIGHT:</span>
                <span className="font-mono text-gray-900">{parameters.right}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">XINCR:</span>
                <span className="font-mono text-gray-900">{parameters.xincr}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">YINCR:</span>
                <span className="font-mono text-gray-900">{parameters.yincr}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">NOCH:</span>
                <span className="font-mono text-gray-900">{parameters.noch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">NSPAN:</span>
                <span className="font-mono text-gray-900">{parameters.nspan}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Bridge Properties */}
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <h4 className="text-sm font-medium text-green-900 mb-2">Bridge Properties</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
            <div>Length: {parameters.lbridge}m</div>
            <div>Spans: {parameters.nspan}</div>
            <div>Top RL: {parameters.toprl}m</div>
            <div>Datum: {parameters.datum}m</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
