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

import java.awt.image.BufferedImage;
import java.io.IOException;

import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFCommandID;
import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaDataInputStream;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class DibStretchBlt extends WMFCommand
{
  BufferedImage img = null;
  private short dstHeight;
  private short dstWidth;
  private short yDst;
  private short xDst;
  @Override
  public void onExecute(WMFRenderer renderer)
  {
    if( img != null)
    {
      int x = (int) ((xDst - renderer.getOffsetX()) * renderer.getScaleRatio() * renderer.getXScale());
      int y = (int) ((yDst - renderer.getOffsetY()) * renderer.getScaleRatio() * renderer.getYScale());

      int w = (int) (dstWidth * renderer.getScaleRatio() * renderer.getXScale());
      int h = (int) (dstHeight * renderer.getScaleRatio() * renderer.getYScale());
      renderer.getGraphics().drawImage(img, x, y, w, h, null);
    }
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    WMFCommandID cmdID = (WMFCommandID) id;
    MetaDataInputStream input = in.openSubStream((int) ((cmdID.getSize() - 3) << 1));
    if( cmdID.getSize() == 28 )
    {
      //without bitmap
      this.id = id;
      return this;
    }
    DibStretchBlt cmd = new DibStretchBlt();
    cmd.id = id;
    input.skip(4L); // ignore RasterOperation

    int srcHeight = input.readShort();
    int srcWidth = input.readShort();
    input.skip(4L); // ignore srcX, srcY

    cmd.dstHeight = input.readShort();
    cmd.dstWidth = input.readShort();
    cmd.yDst = input.readShort();
    cmd.xDst = input.readShort();
    BufferedImage img = StretchDIB.parseDIB(input, srcHeight, srcWidth);

    cmd.img = img;
    return cmd;
  }

}
