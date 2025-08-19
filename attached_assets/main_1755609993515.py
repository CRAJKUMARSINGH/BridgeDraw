from fastapi import FastAPI, HTTPException, UploadFile, File, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import ezdxf
from ezdxf import units
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import tempfile
import os
import json
from datetime import datetime

app = FastAPI(title="BridgeGAD DWG Export Service")

# CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BridgeParameters(BaseModel):
    scale1: float
    datum: float
    left: float
    right: float
    toprl: float
    skew: float
    d1: float
    xincr: float
    yincr: float
    nspan: int
    lbridge: float
    abtl: float
    RTL: float
    sofl: float
    kerbw: float
    kerbd: float
    ccbr: float
    slbthc: float
    slbthe: float
    slbtht: float
    capt: float
    capb: float
    capw: float
    piertw: float
    battr: float
    pierst: float

class CrossSection(BaseModel):
    chainage: float
    level: float
    type: str = "Ground"

class BridgeData(BaseModel):
    parameters: BridgeParameters
    crossSections: List[CrossSection]

def create_bridge_drawing(data: BridgeData, output_path: str):
    """Create a DWG file with bridge drawing"""
    # Create a new DXF document (AutoCAD 2010)
    doc = ezdxf.new(dxfversion='R2010')
    doc.units = units.M
    
    # Add layers
    doc.layers.add("BRIDGE", color=1)
    doc.layers.add("DIMENSIONS", color=5)
    doc.layers.add("TEXT", color=3)
    doc.layers.add("GRID", color=8, linetype="DASHED")
    
    msp = doc.modelspace()
    
    # Add title block
    msp.add_text("BRIDGE DRAWING", dxfattribs={
        'layer': 'TEXT',
        'height': 5.0,
        'style': 'Standard'
    }).set_pos((100, 290), align='MIDDLE_CENTER')
    
    # Add parameters
    msp.add_text(f"Scale: 1:{data.parameters.scale1}", dxfattribs={
        'layer': 'TEXT',
        'height': 2.5,
        'style': 'Standard'
    }).set_pos((20, 280))
    
    # Draw bridge outline (simplified for example)
    msp.add_line((0, 0), (data.parameters.lbridge, 0), dxfattribs={'layer': 'BRIDGE'})
    
    # Add cross-sections
    for i in range(len(data.crossSections) - 1):
        p1 = data.crossSections[i]
        p2 = data.crossSections[i + 1]
        msp.add_line(
            (p1.chainage, p1.level),
            (p2.chainage, p2.level),
            dxfattribs={'layer': 'GRID'}
        )
    
    # Save the DXF file
    doc.saveas(output_path)

@app.post("/api/export/dwg")
async def export_dwg(bridge_data: BridgeData):
    """Export bridge data to DWG format"""
    try:
        # Create a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.dwg') as tmp_file:
            temp_path = tmp_file.name
        
        # Generate the DWG file
        create_bridge_drawing(bridge_data, temp_path)
        
        # Return the file
        return FileResponse(
            path=temp_path,
            filename=f"bridge_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.dwg",
            media_type='application/acad'
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up the temporary file after sending
        if os.path.exists(temp_path):
            os.unlink(temp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
