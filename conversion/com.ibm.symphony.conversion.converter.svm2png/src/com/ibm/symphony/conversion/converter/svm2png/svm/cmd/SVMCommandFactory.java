/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.svm2png.svm.cmd;

import java.util.HashMap;
import java.util.Map;

import com.ibm.symphony.conversion.converter.svm2png.SVMConst;
import com.ibm.symphony.conversion.converter.svm2png.svm.SVMCommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.ICommandFactory;

public class SVMCommandFactory implements ICommandFactory
{
  private static Map<Integer, Command> commandMap;
  private static final UnknownSVMCommand UNKNOWN_COMMAND = new UnknownSVMCommand();
  static {
    commandMap = new HashMap<Integer, Command>();
    commandMap.put(SVMConst.META_LINE_ACTION, new Line());
    commandMap.put(SVMConst.META_RECT_ACTION, new DrawRect());
    commandMap.put(SVMConst.META_ELLIPSE_ACTION, new Ellipse());  
    commandMap.put(SVMConst.META_POLYPOLYGON_ACTION, new PolyPolygon());
    commandMap.put(SVMConst.META_POLYGON_ACTION, new Polygon());
    commandMap.put(SVMConst.META_POLYLINE_ACTION, new PolyLine());
    commandMap.put(SVMConst.META_TEXTARRAY_ACTION, new TextArray());
    commandMap.put(SVMConst.META_BMPSCALE_ACTION, new StretchDIB());
    commandMap.put(SVMConst.META_BMPEXSCALE_ACTION, new StretchDIBEX());
    commandMap.put(SVMConst.META_ISECTRECTCLIPREGION_ACTION, new IntersectClipRect());
    commandMap.put(SVMConst.META_LINECOLOR_ACTION, new ReadColor(SVMConst.META_LINECOLOR_ACTION));
    commandMap.put(SVMConst.META_FILLCOLOR_ACTION, new ReadColor(SVMConst.META_FILLCOLOR_ACTION));
    commandMap.put(SVMConst.META_TEXTCOLOR_ACTION, new ReadColor(SVMConst.META_TEXTCOLOR_ACTION));
    commandMap.put(SVMConst.META_RASTEROP_ACTION, new ReadAlpha());
    commandMap.put(SVMConst.META_POLYGON_FILL_MODE_ACTION, new ReadPolyFillType());   
    commandMap.put(SVMConst.META_MAPMODE_ACTION, new MapMode());
    commandMap.put(SVMConst.META_FONT_ACTION, new ReadFont());
    commandMap.put(SVMConst.META_PUSH_ACTION, new Push());
    commandMap.put(SVMConst.META_POP_ACTION, new Pop());
    commandMap.put(SVMConst.META_TEXTALIGN_ACTION, new TextAlign());
  }
  public Command getCommand(CommandID id)
  {
    SVMCommandID cmdId = (SVMCommandID) id;
    Command cmd = commandMap.get(cmdId.getFunc());
       
    if( cmd == null)
      cmd = UNKNOWN_COMMAND;
      
    return cmd;
  }

}
