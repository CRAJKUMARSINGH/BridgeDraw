import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BridgeParameters {
  scale1: number;
  ablen: number;
  dirth: number;
  alcw: number;
  alfl: number;
  arfl: number;
  alcd: number;
  alfb: number;
  allfbl: number;
  alfrb: number;
  altb: number;
  altfl: number;
  altbr: number;
  alfo: number;
  alfd: number;
  albb: number;
  albbl: number;
  albbr: number;
  scale2: number;
  skew: number;
  datum: number;
  toprl: number;
  left: number;
  right: number;
  xincr: number;
  yincr: number;
  noch: number;
  nspan: number;
  lbridge: number;
  abtl: number;
  rtl: number;
  sofl: number;
  slbtrc: number;
  kerbd: number;
  ccbr: number;
  slthc: number;
  slbthe: number;
  slbtht: number;
  capt: number;
  capb: number;
  capw: number;
  piertw: number;
  battr: number;
  pierst: number;
  ptern: number;
  spani: number;
  futrl: number;
  futd: number;
  futw: number;
  futl: number;
  abtlen: number;
  laslab: number;
  aphth: number;
  apthc: number;
  wcth: number;
}

interface BridgeCanvasProps {
  parameters?: BridgeParameters;
}

export default function BridgeCanvas({ parameters }: BridgeCanvasProps) {
  const [scale, setScale] = useState(1.0);
  const [activeView, setActiveView] = useState("elevation");

  // Default parameters based on the Excel image provided
  const defaultParams: BridgeParameters = {
    scale1: 186,
    ablen: 12.00,
    dirth: 0.30,
    alcw: 0.75,
    alfl: 100.00,
    arfl: 100.75,
    alcd: 1.20,
    alfb: 10.00,
    allfbl: 101.00,
    alfrb: 100.75,
    altb: 10.00,
    altfl: 101.00,
    altbr: 100.75,
    alfo: 1.50,
    alfd: 1.00,
    albb: 3.00,
    albbl: 101.00,
    albbr: 100.75,
    scale2: 100,
    skew: 0.00,
    datum: 100.00,
    toprl: 110.98,
    left: 0.00,
    right: 43.20,
    xincr: 10.00,
    yincr: 1.00,
    noch: 4,
    nspan: 4,
    lbridge: 43.20,
    abtl: 0.00,
    rtl: 110.98,
    sofl: 110.00,
    slbtrc: 0.23,
    kerbd: 0.23,
    ccbr: 11.10,
    slthc: 0.90,
    slbthe: 0.75,
    slbtht: 0.75,
    capt: 110.00,
    capb: 109.40,
    capw: 1.20,
    piertw: 1.20,
    battr: 10.00,
    pierst: 12.00,
    ptern: 1.00,
    spani: 10.80,
    futrl: 100.00,
    futd: 1.00,
    futw: 4.50,
    futl: 12.00,
    abtlen: 12.00,
    laslab: 3.50,
    aphth: 12.00,
    apthc: 0.38,
    wcth: 0.08
  };

  const bridgeParams = parameters || defaultParams;

  const calculateLayout = () => {
    const bridgeLength = bridgeParams.right - bridgeParams.left;
    const bridgeHeight = bridgeParams.toprl - bridgeParams.datum;
    const spanLength = bridgeLength / bridgeParams.nspan;
    
    return {
      bridgeLength,
      bridgeHeight,
      spanLength,
      pierPositions: Array.from({ length: bridgeParams.nspan - 1 }, (_, i) => 
        bridgeParams.left + (i + 1) * spanLength
      ),
      deckLevel: bridgeParams.toprl,
      foundationLevel: bridgeParams.datum
    };
  };

  const layout = calculateLayout();

  const renderElevationView = () => {
    const viewWidth = 800;
    const viewHeight = 400;
    const margin = 60;
    const drawWidth = viewWidth - 2 * margin;
    const drawHeight = viewHeight - 2 * margin;
    
    const xScale = drawWidth / layout.bridgeLength;
    const yScale = drawHeight / layout.bridgeHeight;
    const actualScale = Math.min(xScale, yScale);
    
    const toScreenX = (x: number) => margin + (x - bridgeParams.left) * actualScale;
    const toScreenY = (y: number) => viewHeight - margin - (y - bridgeParams.datum) * actualScale;

    return (
      <div className="bg-white border rounded-lg p-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold">BRIDGE ELEVATION - GENERAL ARRANGEMENT</h3>
          <p className="text-sm text-gray-600">Scale 1:{bridgeParams.scale1} | Length: {layout.bridgeLength.toFixed(1)}m</p>
        </div>
        
        <svg width={viewWidth} height={viewHeight} className="border">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" strokeWidth="0.5"/>
            </pattern>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
            </marker>
          </defs>
          
          <rect width={viewWidth} height={viewHeight} fill="url(#grid)" />
          
          {/* Ground line */}
          <line 
            x1={toScreenX(bridgeParams.left - 5)} 
            y1={toScreenY(bridgeParams.datum)} 
            x2={toScreenX(bridgeParams.right + 5)} 
            y2={toScreenY(bridgeParams.datum)} 
            stroke="#8B4513" 
            strokeWidth="3" 
          />
          
          {/* Bridge deck */}
          <rect
            x={toScreenX(bridgeParams.left)}
            y={toScreenY(bridgeParams.toprl + 0.5)}
            width={(bridgeParams.right - bridgeParams.left) * actualScale}
            height={0.5 * actualScale}
            fill="#E8F4FD"
            stroke="#4A90E2"
            strokeWidth="2"
          />
          
          {/* Piers with Footings */}
          {layout.pierPositions.map((pierX, index) => (
            <g key={`pier-${index}`}>
              {/* Pier shaft */}
              <rect
                x={toScreenX(pierX - bridgeParams.capw/2)}
                y={toScreenY(bridgeParams.toprl)}
                width={bridgeParams.capw * actualScale}
                height={(bridgeParams.toprl - bridgeParams.datum - bridgeParams.futd - 1) * actualScale}
                fill="#8B4513"
                stroke="#654321"
                strokeWidth="2"
              />
              {/* Pier footing */}
              <rect
                x={toScreenX(pierX - bridgeParams.futw/2)}
                y={toScreenY(bridgeParams.datum + bridgeParams.futd)}
                width={bridgeParams.futw * actualScale}
                height={bridgeParams.futd * actualScale}
                fill="#696969"
                stroke="#2F4F4F"
                strokeWidth="2"
              />
              {/* Pier cap */}
              <rect
                x={toScreenX(pierX - bridgeParams.capw/2)}
                y={toScreenY(bridgeParams.toprl + 0.3)}
                width={bridgeParams.capw * actualScale}
                height={0.3 * actualScale}
                fill="#A0522D"
                stroke="#654321"
                strokeWidth="1"
              />
              <text 
                x={toScreenX(pierX)} 
                y={toScreenY(bridgeParams.datum + bridgeParams.futd + 2)} 
                textAnchor="middle" 
                fontSize="12" 
                fill="#000"
              >
                P{index + 1}
              </text>
            </g>
          ))}
          
          {/* Abutments with footings */}
          <g>
            {/* Left Abutment */}
            <rect
              x={toScreenX(bridgeParams.left - bridgeParams.ablen/8)}
              y={toScreenY(bridgeParams.toprl)}
              width={bridgeParams.ablen/8 * actualScale}
              height={(bridgeParams.toprl - bridgeParams.datum - 1) * actualScale}
              fill="#696969"
              stroke="#2F4F4F"
              strokeWidth="2"
            />
            {/* Left Abutment Footing */}
            <rect
              x={toScreenX(bridgeParams.left - bridgeParams.ablen/6)}
              y={toScreenY(bridgeParams.datum + 1)}
              width={bridgeParams.ablen/6 * actualScale}
              height={1 * actualScale}
              fill="#555555"
              stroke="#2F4F4F"
              strokeWidth="2"
            />
            <text 
              x={toScreenX(bridgeParams.left - bridgeParams.ablen/12)} 
              y={toScreenY(bridgeParams.datum + 3)} 
              textAnchor="middle" 
              fontSize="10" 
              fill="#000"
            >
              A1
            </text>
            
            {/* Right Abutment */}
            <rect
              x={toScreenX(bridgeParams.right)}
              y={toScreenY(bridgeParams.toprl)}
              width={bridgeParams.ablen/8 * actualScale}
              height={(bridgeParams.toprl - bridgeParams.datum - 1) * actualScale}
              fill="#696969"
              stroke="#2F4F4F"
              strokeWidth="2"
            />
            {/* Right Abutment Footing */}
            <rect
              x={toScreenX(bridgeParams.right)}
              y={toScreenY(bridgeParams.datum + 1)}
              width={bridgeParams.ablen/6 * actualScale}
              height={1 * actualScale}
              fill="#555555"
              stroke="#2F4F4F"
              strokeWidth="2"
            />
            <text 
              x={toScreenX(bridgeParams.right + bridgeParams.ablen/12)} 
              y={toScreenY(bridgeParams.datum + 3)} 
              textAnchor="middle" 
              fontSize="10" 
              fill="#000"
            >
              A2
            </text>
          </g>
          
          {/* Dimensions */}
          <g stroke="#FF0000" fill="#FF0000" strokeWidth="1">
            <line 
              x1={toScreenX(bridgeParams.left)} 
              y1={toScreenY(bridgeParams.toprl + 3)} 
              x2={toScreenX(bridgeParams.right)} 
              y2={toScreenY(bridgeParams.toprl + 3)} 
            />
            <line 
              x1={toScreenX(bridgeParams.left)} 
              y1={toScreenY(bridgeParams.toprl + 2.5)} 
              x2={toScreenX(bridgeParams.left)} 
              y2={toScreenY(bridgeParams.toprl + 3.5)} 
            />
            <line 
              x1={toScreenX(bridgeParams.right)} 
              y1={toScreenY(bridgeParams.toprl + 2.5)} 
              x2={toScreenX(bridgeParams.right)} 
              y2={toScreenY(bridgeParams.toprl + 3.5)} 
            />
            <text 
              x={toScreenX((bridgeParams.left + bridgeParams.right) / 2)} 
              y={toScreenY(bridgeParams.toprl + 4)} 
              textAnchor="middle" 
              fontSize="10" 
              fill="#FF0000"
            >
              {layout.bridgeLength.toFixed(1)}m
            </text>
          </g>
          
          {/* Grid lines and labels */}
          {Array.from({ length: Math.floor(layout.bridgeLength / bridgeParams.xincr) + 1 }, (_, i) => {
            const x = bridgeParams.left + i * bridgeParams.xincr;
            return (
              <g key={`x-grid-${i}`}>
                <line 
                  x1={toScreenX(x)} 
                  y1={toScreenY(bridgeParams.datum - 2)} 
                  x2={toScreenX(x)} 
                  y2={toScreenY(bridgeParams.toprl + 1)} 
                  stroke="#ccc" 
                  strokeWidth="0.5" 
                  strokeDasharray="2,2"
                />
                <text 
                  x={toScreenX(x)} 
                  y={toScreenY(bridgeParams.datum - 0.5)} 
                  textAnchor="middle" 
                  fontSize="9" 
                  fill="#666"
                >
                  {x.toFixed(0)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderPlanView = () => {
    const viewWidth = 800;
    const viewHeight = 300;
    const margin = 60;
    const drawWidth = viewWidth - 2 * margin;
    const bridgeWidth = 12.0; // Standard bridge width
    
    const xScale = drawWidth / layout.bridgeLength;
    const yScale = 100; // Fixed scale for plan view
    
    const toScreenX = (x: number) => margin + (x - bridgeParams.left) * xScale;
    const toScreenY = (y: number) => viewHeight/2 + y * yScale/bridgeWidth;

    return (
      <div className="bg-white border rounded-lg p-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold">BRIDGE PLAN - GENERAL ARRANGEMENT</h3>
          <p className="text-sm text-gray-600">Scale 1:{bridgeParams.scale1} | Width: {bridgeWidth}m</p>
        </div>
        
        <svg width={viewWidth} height={viewHeight} className="border">
          <rect width={viewWidth} height={viewHeight} fill="url(#grid)" />
          
          {/* Bridge deck outline */}
          <rect
            x={toScreenX(bridgeParams.left)}
            y={toScreenY(-bridgeWidth/2)}
            width={(bridgeParams.right - bridgeParams.left) * xScale}
            height={bridgeWidth * yScale/bridgeWidth}
            fill="#E8F4FD"
            stroke="#4A90E2"
            strokeWidth="3"
          />
          
          {/* Centerline */}
          <line 
            x1={toScreenX(bridgeParams.left)} 
            y1={viewHeight/2} 
            x2={toScreenX(bridgeParams.right)} 
            y2={viewHeight/2} 
            stroke="#FF0000" 
            strokeWidth="2" 
            strokeDasharray="10,5"
          />
          <text 
            x={toScreenX((bridgeParams.left + bridgeParams.right) / 2)} 
            y={viewHeight/2 - 10} 
            textAnchor="middle" 
            fontSize="10" 
            fill="#FF0000"
          >
            ℄ OF BRIDGE
          </text>
          
          {/* Abutments in plan */}
          <rect
            x={toScreenX(bridgeParams.left - bridgeParams.ablen/8)}
            y={toScreenY(-bridgeWidth/2)}
            width={bridgeParams.ablen/8 * xScale}
            height={bridgeWidth * yScale/bridgeWidth}
            fill="#696969"
            stroke="#2F4F4F"
            strokeWidth="2"
          />
          <text 
            x={toScreenX(bridgeParams.left - bridgeParams.ablen/12)} 
            y={toScreenY(bridgeWidth/2 + 1)} 
            textAnchor="middle" 
            fontSize="10" 
            fill="#000"
          >
            A1
          </text>
          
          <rect
            x={toScreenX(bridgeParams.right)}
            y={toScreenY(-bridgeWidth/2)}
            width={bridgeParams.ablen/8 * xScale}
            height={bridgeWidth * yScale/bridgeWidth}
            fill="#696969"
            stroke="#2F4F4F"
            strokeWidth="2"
          />
          <text 
            x={toScreenX(bridgeParams.right + bridgeParams.ablen/12)} 
            y={toScreenY(bridgeWidth/2 + 1)} 
            textAnchor="middle" 
            fontSize="10" 
            fill="#000"
          >
            A2
          </text>
          
          {/* Piers in plan */}
          {layout.pierPositions.map((pierX, index) => (
            <g key={`pier-plan-${index}`}>
              <rect
                x={toScreenX(pierX - bridgeParams.capw/2)}
                y={toScreenY(-bridgeWidth/2)}
                width={bridgeParams.capw * xScale}
                height={bridgeWidth * yScale/bridgeWidth}
                fill="#8B4513"
                stroke="#654321"
                strokeWidth="2"
              />
              <text 
                x={toScreenX(pierX)} 
                y={toScreenY(bridgeWidth/2 + 1)} 
                textAnchor="middle" 
                fontSize="10" 
                fill="#000"
              >
                P{index + 1}
              </text>
            </g>
          ))}
          
          {/* Roadway markings */}
          <rect
            x={toScreenX(bridgeParams.left)}
            y={toScreenY(-1)}
            width={(bridgeParams.right - bridgeParams.left) * xScale}
            height={2 * yScale/bridgeWidth}
            fill="none"
            stroke="#FFD700"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        </svg>
      </div>
    );
  };

  const renderCrossSection = () => {
    const sectionWidth = 600;
    const sectionHeight = 400;
    const bridgeWidth = 12.0;
    const slabThickness = bridgeParams.slthc || 0.9;
    const kerbHeight = bridgeParams.kerbd || 0.23;
    const pierWidth = bridgeParams.capw || 1.2;
    const foundationWidth = bridgeParams.futw || 4.5;
    const foundationDepth = bridgeParams.futd || 1.0;
    
    return (
      <div className="bg-white border rounded-lg p-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold">TYPICAL CROSS SECTION AT PIER</h3>
          <p className="text-sm text-gray-600">Scale 1:{bridgeParams.scale2}</p>
        </div>
        
        <svg width={sectionWidth} height={sectionHeight} className="border">
          <rect width={sectionWidth} height={sectionHeight} fill="url(#grid)" />
          
          {/* Ground line */}
          <line x1="50" y1="300" x2="550" y2="300" stroke="#8B4513" strokeWidth="3"/>
          
          {/* Foundation */}
          <rect 
            x={300 - foundationWidth * 10} 
            y={300 - foundationDepth * 20} 
            width={foundationWidth * 20} 
            height={foundationDepth * 20} 
            fill="#696969" 
            stroke="#2F4F4F" 
            strokeWidth="2"
          />
          
          {/* Pier shaft */}
          <rect 
            x={300 - pierWidth * 10} 
            y={120 + slabThickness * 20} 
            width={pierWidth * 20} 
            height={300 - foundationDepth * 20 - (120 + slabThickness * 20)} 
            fill="#8B4513" 
            stroke="#654321" 
            strokeWidth="2"
          />
          
          {/* Pier cap */}
          <rect 
            x={300 - (pierWidth + 0.2) * 10} 
            y="115" 
            width={(pierWidth + 0.4) * 20} 
            height="10" 
            fill="#A0522D" 
            stroke="#654321" 
            strokeWidth="2"
          />
          
          {/* Bridge slab */}
          <rect 
            x={300 - bridgeWidth * 10} 
            y="120" 
            width={bridgeWidth * 20} 
            height={slabThickness * 20} 
            fill="#E8F4FD" 
            stroke="#4A90E2" 
            strokeWidth="2"
          />
          
          {/* Left kerb */}
          <rect 
            x={300 - bridgeWidth * 10} 
            y={120 - kerbHeight * 20} 
            width="15" 
            height={(slabThickness + kerbHeight) * 20} 
            fill="#CCCCCC" 
            stroke="#999" 
            strokeWidth="1"
          />
          
          {/* Right kerb */}
          <rect 
            x={300 + bridgeWidth * 10 - 15} 
            y={120 - kerbHeight * 20} 
            width="15" 
            height={(slabThickness + kerbHeight) * 20} 
            fill="#CCCCCC" 
            stroke="#999" 
            strokeWidth="1"
          />
          
          {/* Carriageway surface */}
          <rect 
            x={300 - (bridgeWidth - 1) * 10} 
            y="118" 
            width={(bridgeWidth - 2) * 20} 
            height="4" 
            fill="#333" 
            stroke="#000" 
            strokeWidth="1"
          />
          
          {/* Dimensions */}
          <g stroke="#FF0000" fill="#FF0000" strokeWidth="1">
            {/* Total width dimension */}
            <line x1={300 - bridgeWidth * 10} y1="80" x2={300 + bridgeWidth * 10} y2="80"/>
            <line x1={300 - bridgeWidth * 10} y1="75" x2={300 - bridgeWidth * 10} y2="85"/>
            <line x1={300 + bridgeWidth * 10} y1="75" x2={300 + bridgeWidth * 10} y2="85"/>
            <text x="300" y="70" textAnchor="middle" fontSize="12">{bridgeWidth.toFixed(2)}m Total Width</text>
            
            {/* Carriageway width */}
            <line x1={300 - (bridgeWidth - 1) * 10} y1="350" x2={300 + (bridgeWidth - 1) * 10} y2="350"/>
            <text x="300" y="365" textAnchor="middle" fontSize="10">{(bridgeWidth - 2).toFixed(2)}m Carriageway</text>
            
            {/* Pier width */}
            <line x1={300 - pierWidth * 10} y1="370" x2={300 + pierWidth * 10} y2="370"/>
            <text x="300" y="385" textAnchor="middle" fontSize="10">{pierWidth.toFixed(2)}m Pier</text>
          </g>
          
          {/* Labels */}
          <text x="80" y="320" fontSize="12" fill="#8B4513">Ground Level</text>
          <text x="320" y="200" fontSize="10" fill="#8B4513">Pier</text>
          <text x="320" y="285" fontSize="10" fill="#696969">Foundation</text>
          <text x="220" y="110" fontSize="10" fill="#4A90E2">Bridge Slab</text>
          
          <text x="300" y="395" textAnchor="middle" fontSize="12" fill="#666">
            Slab: {slabThickness}m | Kerb: {kerbHeight}m | Foundation: {foundationWidth}×{foundationDepth}m
          </text>
        </svg>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bridge Technical Drawing</h2>
            <p className="text-sm text-gray-500">Generated from GAD Parameters</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale(Math.max(0.5, scale - 0.1))}
              data-testid="button-zoom-out"
            >
              <i className="fas fa-search-minus mr-1"></i>
              Zoom Out
            </Button>
            <span className="text-sm text-gray-600 px-2">{(scale * 100).toFixed(0)}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale(Math.min(2.0, scale + 0.1))}
              data-testid="button-zoom-in"
            >
              <i className="fas fa-search-plus mr-1"></i>
              Zoom In
            </Button>
          </div>
        </div>

        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="elevation" data-testid="tab-elevation">Elevation</TabsTrigger>
            <TabsTrigger value="plan" data-testid="tab-plan">Plan</TabsTrigger>
            <TabsTrigger value="section" data-testid="tab-section">Cross Section</TabsTrigger>
          </TabsList>
          
          <TabsContent value="elevation" className="mt-6" style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            {renderElevationView()}
          </TabsContent>
          
          <TabsContent value="plan" className="mt-6" style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            {renderPlanView()}
          </TabsContent>
          
          <TabsContent value="section" className="mt-6" style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            {renderCrossSection()}
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Drawing Information</h4>
          <div className="grid grid-cols-2 gap-4 text-xs text-blue-700">
            <div>Bridge Length: {layout.bridgeLength.toFixed(1)}m</div>
            <div>Number of Spans: {bridgeParams.nspan}</div>
            <div>Span Length: {layout.spanLength.toFixed(1)}m</div>
            <div>Bridge Height: {layout.bridgeHeight.toFixed(1)}m</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}