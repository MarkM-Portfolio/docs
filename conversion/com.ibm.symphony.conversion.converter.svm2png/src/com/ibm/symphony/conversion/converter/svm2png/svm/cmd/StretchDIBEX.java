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

import java.awt.image.BufferedImage;
import java.io.IOException;

import com.ibm.symphony.conversion.converter.svm2png.SVMBitmap;
import com.ibm.symphony.conversion.converter.svm2png.svm.SVMCommandID;
import com.ibm.symphony.conversion.converter.svm2png.svm.SVMRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.ByteUtil;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class StretchDIBEX extends SVMCommand
{
  BufferedImage img = null;
  int dstHeight;
  int dstWidth;
  int xDst;
  int yDst;
  
  @Override
  public void onExecute(SVMRenderer renderer)
  {
    if(img == null)
      return;
    
    int x = (int) ((xDst - renderer.getOffsetX()) * renderer.getScaleRatio() * renderer.getXScale());
    int y = (int) ((yDst - renderer.getOffsetY()) * renderer.getScaleRatio() * renderer.getYScale());   
    int w = (int) (dstWidth * renderer.getScaleRatio() * renderer.getXScale());
    int h = (int) (dstHeight * renderer.getScaleRatio() * renderer.getYScale());
    
    renderer.getGraphics().drawImage( img, x, y, w, h, null);
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    StretchDIBEX cmd = new StretchDIBEX();
    cmd.id = id;
    SVMCommandID cmdID = (SVMCommandID) id;
    byte[] params = new byte[(int) cmdID.getSize()];
    in.read(params);

    int base = 0;
    SVMBitmap svmBitmap = new SVMBitmap();
    svmBitmap.parseBitmap(params, base);
    if (svmBitmap.isError())
      return cmd;
    base += svmBitmap.getReadByte();

    base += 8;
    SVMBitmap mask = new SVMBitmap();
    if (params[base] == 2)
    {
      base++;
      mask.parseBitmap(params, base);
      if (svmBitmap.isError())
        return cmd;
    }
    //how to deal with mask and img???????
    
    //read startpoint and size
    base = params.length - 16;
    cmd.xDst = ByteUtil.readInt(params[base], params[base+1], params[base+2], params[base+3]);
    cmd.yDst = ByteUtil.readInt(params[base+4], params[base+5], params[base+6], params[base+7]);
    cmd.dstWidth = ByteUtil.readInt(params[base+8], params[base+9], params[base+10], params[base+11]);
    cmd.dstHeight = ByteUtil.readInt(params[base+12], params[base+13], params[base+14], params[base+15]);

    int srcWidth = svmBitmap.getWidth();
    int srcHeight = svmBitmap.getHeight();
    int[] color = svmBitmap.getColor();
    
    cmd.img = new BufferedImage(srcWidth, srcHeight, BufferedImage.TYPE_INT_ARGB );
    
    int maskWidth = mask.getWidth();
    int maskHeight = mask.getHeight();
    int[] maskColor = mask.getColor();
    for( int i=0;i<maskHeight;i++ )
    {
      for ( int j=0;j<maskWidth;j++ )
      {
        if(maskColor[i * maskWidth + j] != 0xffffffff)
          cmd.img.setRGB(j, i, maskColor[i * maskWidth + j]);
      }
    }
    
    for( int i=0;i<srcHeight;i++ )
    {
      for ( int j=0;j<srcWidth;j++ )
      {
        int maskcolor = cmd.img.getRGB(j, i);
        if(maskcolor == 0xff000000)
          cmd.img.setRGB(j, i, color[i * srcWidth + j]);
      }
    }
    
    return cmd;
  }

}
