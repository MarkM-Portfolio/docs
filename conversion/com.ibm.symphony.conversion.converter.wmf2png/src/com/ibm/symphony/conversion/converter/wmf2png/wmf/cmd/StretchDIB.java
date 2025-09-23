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
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

import javax.imageio.ImageIO;

import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFCommandID;
import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaDataInputStream;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class StretchDIB extends WMFCommand
{

  BufferedImage img = null;

  private int dstHeight;

  private int dstWidth;

  private short xDst;

  private short yDst;

  @Override
  public void onExecute(WMFRenderer renderer)
  {

    int x = (int) ((xDst - renderer.getOffsetX()) * renderer.getScaleRatio() * renderer.getXScale());
    int y = (int) ((yDst - renderer.getOffsetY()) * renderer.getScaleRatio() * renderer.getYScale());

    int w = (int) (dstWidth * renderer.getScaleRatio() * renderer.getXScale());
    int h = (int) (dstHeight * renderer.getScaleRatio() * renderer.getYScale());
    renderer.getGraphics().drawImage(img, x, y, w, h, null);

  }

  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    StretchDIB cmd = new StretchDIB();
    cmd.id = id;

    WMFCommandID cmdID = (WMFCommandID) id;
    MetaDataInputStream input = in.openSubStream((int) ((cmdID.getSize() - 3) << 1));
    input.skip(6L); // ignore RasterOperation and ColorUsage

    int srcHeight = input.readShort();
    int srcWidth = input.readShort();
    input.skip(4L); // ignore srcX, srcY

    cmd.dstHeight = input.readShort();
    cmd.dstWidth = input.readShort();
    cmd.yDst = input.readShort();
    cmd.xDst = input.readShort();

    // read DIB

    BufferedImage img = parseDIB(input, srcHeight, srcWidth);

    cmd.img = img;
    return cmd;
  }

  public static BufferedImage parseDIB(MetaDataInputStream input, int srcHeight, int srcWidth) throws IOException
  {
    int headSize = input.readInt();
    int bitCount = 0;
    long colorUsed = -1;
    long compression = -1;
    int plane = 1;
    if (headSize == 0x0000000C)
    {
      // BitmapCoreHeader
      srcWidth = input.readWORD();
      srcHeight = input.readWORD();
      plane = input.readWORD();
      bitCount = input.readWORD();
    }
    else
    {
      // BitmapInfoHeader
      srcWidth = input.readInt();
      srcHeight = input.readInt();
      plane = input.readWORD();
      bitCount = input.readWORD();
      compression = input.readDWORD();
      input.skip(12L);
      colorUsed = input.readDWORD();
      input.skip(4L);
    }
    int bytePerRow = ((srcWidth * plane * bitCount + 31) & ~31) / 8;
    int byteToSkip = bytePerRow - srcWidth * plane * bitCount / 8;

    BufferedImage img = new BufferedImage(srcWidth, srcHeight, BufferedImage.TYPE_INT_RGB);
    if (bitCount == 0x0018)
    {
      /*
       * The bitmap has a maximum of 2^24 colors, and the Colors field of DIB is NULL. Each 3-byte triplet in the bitmap array represents
       * the relative intensities of blue, green, and red, respectively, for a pixel.
       */
      for (int i = srcHeight - 1; i >= 0; i--)
      {
        for (int j = 0; j < srcWidth; j++)
        {
          img.setRGB(j, i, readColor(input));
        }
        input.skip(byteToSkip);
      }
    }
    else if (bitCount == 0x001)
    {
      /*
       * The image is specified with two colors. Each pixel in the bitmap is represented by a single bit. If the bit is clear, the pixel is
       * displayed with the color of the first entry in the color table; if the bit is set, the pixel has the color of the second entry in
       * the table.
       */
      int color1 = readColor(input);
      input.skip(1L);
      int color2 = readColor(input);
      input.skip(1L);
      int pixelIndex = 0;
      int pixelGroup = 0;// each pixelGroup means 8 pixels( 1byte = 8bits)
      int[] mask = { 0x1, 0x2, 0x4, 0x8, 0x10, 0x20, 0x40, 0x80 };
      for (int i = srcHeight - 1; i >= 0; i--)
      {
        for (int j = 0; j < srcWidth; j++)
        {
          int index = pixelIndex % 8;
          if (index == 0)
          {
            pixelGroup = input.read();
          }
          int colorMask = pixelGroup & mask[index];
          if (colorMask == 0)
            img.setRGB(j, i, color1);
          else
            img.setRGB(j, i, color2);
          pixelIndex++;
        }
        input.skip(byteToSkip);
      }
    }
    else if (bitCount == 0x0004)
    {
      /*
       * Each pixel in the bitmap is represented by a 4-bit index into the color table, and each byte contains 2 pixels.
       */
      int[] colorTable = new int[16];
      for( int i=0;i< colorTable.length;i++)
      {
        colorTable[i] = readColor(input);
        input.skip(1L);
      }
      for (int i = srcHeight - 1; i >= 0; i--)
      {
        for (int j = 0; j < srcWidth; j+=2)
        {
          //1 byte = 2 pixels
          int pixelGroup = input.read();
          int pixelLow = pixelGroup & 0xf;
          img.setRGB(j, i, colorTable[ pixelLow ]);
          int pixelHigh = (pixelGroup & 0xf0) >>> 4;
          img.setRGB(j + 1, i, colorTable[ pixelHigh ]);
        }
        input.skip(byteToSkip);
      }
    }
    else if (bitCount == 0x0008)
    {
      /*
       * Each pixel in the bitmap is represented by an 8-bit index into the color table, and each byte contains 1 pixel.
       */
      int[] colorTable = new int[256];
      for( int i=0;i< colorTable.length;i++)
      {
        colorTable[i] = readColor(input);
        input.skip(1L);
      }
      for (int i = srcHeight - 1; i >= 0; i--)
      {
        for (int j = 0; j < srcWidth; j++)
        {
          //1 byte = 1 pixels
          int pixel = input.read();
          img.setRGB(j, i, colorTable[ pixel ]);
          
        }
        input.skip(byteToSkip);
      }
    }
    else
    {
      System.out.println(bitCount);
    }
    //ImageIO.write(img, "png", new FileOutputStream("d:/tmp.png"));
    
    return img;
  }

  /*
   * @Override protected Command read(MetaInputStream in, CommandID id) throws IOException { StretchDIB cmd = new StretchDIB(); cmd.id = id;
   * WMFCommandID cmdID=(WMFCommandID)id; byte[] params = new byte[ (int) (cmdID.getSize() -3) << 1 ];
   * 
   * in.read(params);
   * 
   * 
   * // ignore RasterOperation and ColorUsage int srcHeight = ByteUtil.readWord(params[2 * 3], params[2 * 3 + 1]); int srcWidth =
   * ByteUtil.readWord(params[2 * 4], params[2 * 4 + 1]); cmd.dstHeight = ByteUtil.readWord(params[2 * 7], params[2 * 7 + 1]); cmd.dstWidth
   * = ByteUtil.readWord(params[2 * 8], params[2 * 8 + 1]); cmd.yDst = (short) ByteUtil.readWord(params[2 * 9], params[2 * 9 + 1]); cmd.xDst
   * = (short) ByteUtil.readWord(params[2 * 10], params[2 * 10 + 1]);
   * 
   * int bytePerRow = ((srcWidth * 24 + 31) & ~31) / 8;
   * 
   * cmd.img = new BufferedImage(srcWidth, srcHeight, BufferedImage.TYPE_USHORT_565_RGB );
   * 
   * int[] colors = getColors(params, 2 * 11 + 4 * 10, srcWidth, srcHeight, bytePerRow);
   * 
   * for( int i=0;i<srcHeight;i++ ) { for ( int j=0;j<srcWidth;j++ ) { cmd.img.setRGB(j, i, colors[i * srcWidth + j]); } }
   * 
   * 
   * 
   * return cmd; }
   */
  private static int readColor(InputStream in) throws IOException
  {
    int b1 = in.read();
    int b2 = in.read();
    int b3 = in.read();
    return ((b3 & 0xff) << 16) | ((b2 & 0xff) << 8) | (b1 & 0xff);
  }

}
