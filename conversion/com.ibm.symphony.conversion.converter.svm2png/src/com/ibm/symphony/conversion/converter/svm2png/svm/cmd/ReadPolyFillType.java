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

import java.awt.geom.GeneralPath;
import java.io.IOException;

import com.ibm.symphony.conversion.converter.svm2png.svm.SVMRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class ReadPolyFillType extends SVMCommand
{
  int polyFillType;
  
  @Override
  public void onExecute(SVMRenderer renderer)
  {
    if (polyFillType == 1)
    {
      renderer.setWindingRule(GeneralPath.WIND_NON_ZERO);
    }
    else
    {
      renderer.setWindingRule(GeneralPath.WIND_EVEN_ODD);
    }
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    ReadPolyFillType cmd = new ReadPolyFillType();
    cmd.id = id;
    cmd.polyFillType = in.readWORD();
    
    return cmd;
  }

}
