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
import java.util.Stack;

import com.ibm.symphony.conversion.converter.svm2png.SVMConst;
import com.ibm.symphony.conversion.converter.svm2png.SVMStackObject;
import com.ibm.symphony.conversion.converter.svm2png.svm.SVMRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class Pop extends SVMCommand
{ 
  @Override
  public void onExecute(SVMRenderer renderer)
  {
    Stack<SVMStackObject> statusStack = renderer.getStatusStack();
    if(statusStack.empty())
      return;
    
    SVMStackObject data = statusStack.pop();
    int flag = data.flag;
    if((flag & SVMConst.PUSH_LINECOLOR) > 0){
        renderer.setMBLineColor(data.mbLineColor);
        renderer.setStrokePaint(data.strokePaint);
    }
    if((flag & SVMConst.PUSH_FILLCOLOR) > 0){
        renderer.setMBFillColor(data.mbFillColor);
        renderer.setFillPaint(data.fillPaint);
    }
    if((flag & SVMConst.PUSH_MAPMODE) > 0){
        renderer.setOffsetX(data.mapmode.maOriginX);
        renderer.setOffsetY(data.mapmode.maOriginY);
        renderer.setXScale(data.mapmode.scaleX);
        renderer.setYScale(data.mapmode.scaleY);
    }
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    Pop cmd = new Pop();
    cmd.id = id;
    return cmd;
  }

}
