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

import java.awt.Color;
import java.io.IOException;

import com.ibm.symphony.conversion.converter.svm2png.SVMConst;
import com.ibm.symphony.conversion.converter.svm2png.svm.SVMCommandID;
import com.ibm.symphony.conversion.converter.svm2png.svm.SVMRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class ReadColor extends SVMCommand
{
  Color color;
  int flag;
  long size;
  int colorType;
  
  public ReadColor(int colorType)
  {
    this.colorType = colorType;
  }
  
  @Override
  public void onExecute(SVMRenderer renderer)
  {
    if(colorType == SVMConst.META_FILLCOLOR_ACTION)
    {
      if(size > 4)
      {
        if (flag > 0)
        {
          renderer.setMBFillColor(true);
          renderer.setFillAlpha(255);
        }
        else
        {
          renderer.setMBFillColor(false);
          renderer.setFillAlpha(0);
        }
      }
      renderer.setFillPaint(color);
    }
    else if(colorType == SVMConst.META_LINECOLOR_ACTION)
    {
      if(size > 4)
      {
        if (flag > 0)
          renderer.setMBLineColor(true);
        else
          renderer.setMBLineColor(false);
      }
      renderer.setStrokePaint(color);
    }
    else if(colorType == SVMConst.META_TEXTCOLOR_ACTION)
      renderer.setTextPaint(color);
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    ReadColor cmd = new ReadColor(colorType);
    cmd.id = id;
    
    int b = in.read();
    int g = in.read();
    int r = in.read();
    in.skip(1);
    
    cmd.size = ((SVMCommandID) id).getSize();
    if( cmd.size > 4)
    {
      cmd.flag = in.read();        
      if (cmd.flag > 0)
        cmd.color = new Color(((255 & 0xff) << 24) | ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff));
      else
        cmd.color = null;
    }
    else
      cmd.color = new Color(((255 & 0xff) << 24) | ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff));
    
    return cmd;
  }

}
