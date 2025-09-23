/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.wmf2png.wmf.cmd;

import java.util.HashMap;
import java.util.Map;

import com.ibm.symphony.conversion.converter.wmf2png.WMFConst;
import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFCommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.ICommandFactory;

public class WMFCommandFactory implements ICommandFactory
{

  private static Map<Integer, Command> commandMap;
  private static final UnknownWMFCommand UNKNOWN_COMMAND = new UnknownWMFCommand();
  private static final DefaultCreateObjectCommand DEFAULT_CREATE = new DefaultCreateObjectCommand();
  static {
    commandMap = new HashMap<Integer, Command>();
    commandMap.put(WMFConst.SetWindowOrg , new SetWindowOrg() );
    commandMap.put(WMFConst.SelectObject, new SelectObject() );
    commandMap.put(WMFConst.DeleteObject, new DelectObject() );
    commandMap.put(WMFConst.CreatePenIndirect, new CreatePenIndirect() );
    commandMap.put(WMFConst.CreateFontIndirect , new CreateFontIndirect() );
    commandMap.put(WMFConst.CreateBrushIndirect, new CreateBrushIndirect() );
    commandMap.put(WMFConst.PolyPolygon, new PolyPolygon());
    commandMap.put(WMFConst.Polygon, new Polygon());
    commandMap.put(WMFConst.Polyline, new PolyLine());
    commandMap.put(WMFConst.SetWindowExt, new SetWindowExt());
    commandMap.put(WMFConst.Ellipse, new Ellipse());
    commandMap.put(WMFConst.SetPolyFillMode, new SetPolyFillMode());
    commandMap.put(WMFConst.SaveDC, new SaveDC());
    commandMap.put(WMFConst.RestoreDC, new RestoreDC());
    commandMap.put(WMFConst.SetTextColor, new SetTextColor());
    commandMap.put(WMFConst.SetROP2, new SetROP2());
    commandMap.put(WMFConst.IntersectClipRect, new IntersectClipRect());
    commandMap.put(WMFConst.StretchDIBits, new StretchDIB());
    commandMap.put(WMFConst.DibStretchBlt, new DibStretchBlt());
    commandMap.put(WMFConst.ExtTextOut, new ExtTextOut());
    commandMap.put(WMFConst.TextOut, new TextOut());
    commandMap.put(WMFConst.SetTextAlign, new SetTextAlign());
    commandMap.put(WMFConst.MoveTo, new MoveTo());
    commandMap.put(WMFConst.LineTo, new LineTo());
    commandMap.put(WMFConst.Rectangle, new Rectangle());
    
    commandMap.put(WMFConst.CreateBrush, DEFAULT_CREATE );
    commandMap.put(WMFConst.CreatePalette, DEFAULT_CREATE );
    commandMap.put(WMFConst.CreatePatternBrush, DEFAULT_CREATE );
    commandMap.put(WMFConst.CreateRegion, DEFAULT_CREATE );
    commandMap.put(WMFConst.DibCreatePatternBrush, DEFAULT_CREATE );

    
  }
  public Command getCommand(CommandID id)
  {
    WMFCommandID cmdId = (WMFCommandID) id;
    Command cmd = commandMap.get(cmdId.getFunc());
    
    
    if( cmd == null)
      cmd = UNKNOWN_COMMAND;
    
    
    
    return cmd;
  }

}
