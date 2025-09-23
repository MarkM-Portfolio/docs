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

import com.ibm.symphony.conversion.converter.svm2png.svm.SVMCommandID;
import com.ibm.symphony.conversion.converter.svm2png.svm.SVMRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.ByteUtil;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class TextArray extends SVMCommand
{
  float x, y;
  int index, len;
  String str;
  
  @Override
  public void onExecute(SVMRenderer renderer)
  {
    float xx = (int) ((x - renderer.getOffsetX()) * renderer.getScaleRatio() * renderer.getXScale());
    float yy = (int) ((y - renderer.getOffsetY()) * renderer.getScaleRatio() * renderer.getYScale());
    
    if(str != null && (index + len) <= str.length())
      renderer.drawText(str.substring(index, index+len), xx, renderer.getTextAlign() == 0 ? yy += renderer.getSVMFont().height:yy);
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    TextArray cmd = new TextArray();
    cmd.id = id;
     
    cmd.x = in.readInt();
    cmd.y = in.readInt();
    int sLen = in.readWORD();
    
    byte[] params = new byte[(int) ((SVMCommandID) id).getSize()-10];
    in.read(params);
    int first = params[0] & 0xff;
    int second = params[1] & 0xff;
   
    if(params[0] == 0)
    {
      //unicode encoding
      StringBuffer text = new StringBuffer("");
      char c;
      int l,h;
      for(int i = 0;i < sLen;i++){
          l = params[2+i*2];
          h = params[2+i*2+1];
          c = (char) ((l & 0xff) | ((h << 8) & 0xff00));
          text.append(c);
      }
      cmd.str = text.toString();
      cmd.index = ByteUtil.readWord(params[sLen *2 +2], params[sLen *2 +3]);
      cmd.len = ByteUtil.readWord(params[sLen *2 +4], params[sLen *2 +5]);
    }
    else if(first>=0x81 && first<=0xFE && second>=0x40 && second<=0xFE)
    {
      //two bytes for a single character
      byte[] temp = new byte[sLen];
      for(int i = 0;i < sLen;i++){
        temp[i]=params[i];
      }
      
      cmd.str = new String(temp, "GB2312");
      cmd.index = ByteUtil.readWord(params[sLen], params[sLen+1]);
      cmd.len = ByteUtil.readWord(params[sLen+2], params[sLen+3]);
    }
    else
    {
      char[] array= new char[sLen];    
      for (int i = 0; i < sLen; i++)
        array[i] = (char) (params[i] & 0xff);
      
      cmd.str = String.valueOf(array);
      cmd.index = ByteUtil.readWord(params[sLen], params[sLen+1]);
      cmd.len = ByteUtil.readWord(params[sLen+2], params[sLen+3]);
    }
    
    return cmd;
  }

}
