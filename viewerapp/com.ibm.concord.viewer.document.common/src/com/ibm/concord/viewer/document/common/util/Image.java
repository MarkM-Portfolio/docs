package com.ibm.concord.viewer.document.common.util;
import java.awt.Dimension;
import java.io.File;
import java.io.IOException;
import java.util.Iterator;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;

public class Image
{
  private String fileName;
  private boolean isCorrupted = false;

  private Dimension d = new Dimension(-1, -1);

  public Image(String fn)
  {
    fileName = fn;
    File img = new File(fileName);
    ImageInputStream in = null;
    try
    {
      in = ImageIO.createImageInputStream(img);
      final Iterator<ImageReader> readers = ImageIO.getImageReaders(in);
      if (readers.hasNext())
      {
        ImageReader reader = (ImageReader) readers.next();
        try
        {
          reader.setInput(in);
          d.setSize(new Dimension(reader.getWidth(0), reader.getHeight(0)));
          //check if corrupted
          if (reader.getFormatName().equalsIgnoreCase("jpeg")) {
            in.seek(img.length() - 2);
            final byte[] lastTwoBytes = new byte[2];
            in.read(lastTwoBytes);
            isCorrupted = !((lastTwoBytes[0]&0xff) == 0xff && (lastTwoBytes[1]&0xff) == 0xd9);
          }
          else if (reader.getFormatName().equalsIgnoreCase("png"))
          {
            in.seek(img.length() - 8);
            final byte[] lastEightBytes = new byte[8];
            in.read(lastEightBytes);
            isCorrupted = !((lastEightBytes[0] & 0xff) == 0x49 && (lastEightBytes[1] & 0xff) == 0x45 && (lastEightBytes[2] & 0xff) == 0x4E && (lastEightBytes[3] & 0xff) == 0x44);
          }
          else // other formats
          {
            try 
            {
              ImageIO.read(img);
            }
            catch (Exception e)
            {
              isCorrupted = true;
            }
          }
        }
        finally
        {
          reader.dispose();
        }
      }
      else
      {
        isCorrupted = true;
      }
    }
    catch (IOException e)
    {
      isCorrupted = true;
    }
    finally
    {
      if (in != null)
      {
        try
        {
          in.close();
        }
        catch (IOException e)
        {
        }
      }
    }
  }

  public int getWidth() {
    return (int)d.getWidth();
  }
  
  public int getHeight() {
    return (int)d.getHeight();
  }

  public boolean isCorrupted()
  {
    return isCorrupted;
  }
}
