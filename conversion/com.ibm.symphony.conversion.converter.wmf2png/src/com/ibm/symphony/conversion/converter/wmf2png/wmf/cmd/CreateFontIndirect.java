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

import java.awt.Font;
import java.io.IOException;

import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFCommandID;
import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaDataInputStream;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class CreateFontIndirect extends CreateObject
{
  private short height;
  private String fontName;
  private int fontStyle = 0;
  
  @Override
  public void onSelectObject(WMFRenderer renderer)
  {
    if( fontName != null && fontName.length() > 0 && height > 0 )
    {
      Font font = new Font(fontName, fontStyle, (int)( height * renderer.getScaleRatio() * renderer.getYScale()));
      renderer.setFont(font);
    }
  }

  @Override
  protected Command read(MetaInputStream in2, CommandID id) throws IOException
  {
    WMFCommandID cmdID = (WMFCommandID) id;
    CreateFontIndirect cmd = new CreateFontIndirect();
    if( cmdID.getSize() > 3 )
    {
      MetaDataInputStream input = in2.openSubStream( (int)( cmdID.getSize() - 3 ) << 1);
      short h = input.readShort();
      cmd.height = (short) Math.abs(h);
      short width = input.readShort();
      input.skip(4L);
      short weight = input.readShort();
      if( weight >= 700 )
      {
        cmd.fontStyle = Font.BOLD;
      }
      byte italic = (byte) input.read();
      if( italic != 0)
      {
        cmd.fontStyle |= Font.ITALIC;
      }
      input.skip(7L);
      
      int maxLen = (int) ((cmdID.getSize() - 3) << 1);
      maxLen -= 2 + 2 + 4 + 2 + 1 + 7;
      byte[] textBuf = new byte[maxLen];
      int acturalLen = 0;
      for(int i=0;i<maxLen;i++)
      {
        textBuf[i] = (byte) input.read();
        if( textBuf[i] == 0 )
        {
          break;
        }
        acturalLen++;
      }
      
      String name = new String(textBuf, 0, acturalLen).trim();
      cmd.fontName = name; 
    }
    cmd.id = cmdID;
    return cmd;
  }

}
