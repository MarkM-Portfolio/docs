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

import java.io.IOException;

import com.ibm.symphony.conversion.converter.svm2png.PreMapMode;
import com.ibm.symphony.conversion.converter.svm2png.SVMConst;
import com.ibm.symphony.conversion.converter.svm2png.SVMStackObject;
import com.ibm.symphony.conversion.converter.svm2png.svm.SVMRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class Push extends SVMCommand
{
  int flag;
  
  @Override
  public void onExecute(SVMRenderer renderer)
  {
    SVMStackObject data = new SVMStackObject();
    data.flag = flag;
    if((data.flag & SVMConst.PUSH_LINECOLOR) > 0){
      data.mbLineColor = renderer.getMBLineColor();
      data.strokePaint = renderer.getStrokePaint();
    }
    if((data.flag & SVMConst.PUSH_FILLCOLOR) > 0){
        data.mbFillColor = renderer.getMBFillColor();
        data.fillPaint = renderer.getFillPaint();
    }
    if((data.flag & SVMConst.PUSH_MAPMODE) > 0){
        data.mapmode = new PreMapMode();
        data.mapmode.maOriginX = renderer.getOffsetX();
        data.mapmode.maOriginY = renderer.getOffsetY();
        data.mapmode.scaleX = renderer.getXScale();
        data.mapmode.scaleY = renderer.getYScale();
    }
    renderer.getStatusStack().push(data);
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    Push cmd = new Push();
    cmd.id = id;   
    cmd.flag = in.readWORD();
    
    return cmd;
  }

}
