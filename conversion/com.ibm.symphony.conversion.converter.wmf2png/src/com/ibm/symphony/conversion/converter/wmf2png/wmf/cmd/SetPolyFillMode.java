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

import java.awt.geom.GeneralPath;
import java.io.IOException;

import com.ibm.symphony.conversion.converter.wmf2png.WMFConst;
import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFCommandID;
import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class SetPolyFillMode extends WMFCommand
{

  private int windingRule;

  @Override
  public void onExecute(WMFRenderer renderer)
  {
    renderer.setWindingRule(windingRule);
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    SetPolyFillMode cmd = new SetPolyFillMode();
    cmd.id = id;
    int polyFillMode = in.readWORD();
    if( polyFillMode == WMFConst.ALTERNATE)
    {
      cmd.windingRule = GeneralPath.WIND_NON_ZERO;
    }
    else
    {
      cmd.windingRule = GeneralPath.WIND_EVEN_ODD;
    }
    
    WMFCommandID wmfID=(WMFCommandID)id;
    if( wmfID.getSize() == 5)
      in.skip(2L); // optional reseved parameter(word), just skip it.
    
    return cmd;
  }

}
