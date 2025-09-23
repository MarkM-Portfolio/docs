/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.svm2png;

import com.ibm.symphony.conversion.converter.svm2png.CompressUtil;
import com.ibm.symphony.conversion.convertor.metafile.common.ByteUtil;

public class SVMBitmap
{
  private static final int SVM_DEFLATE_COMPRESS = 16794707;

  private static final int BitMap_Sign = 0x4d42;

  private int[] colors;

  private int startindex;

  private int filesize, datafilesize;

  private int width, height;

  private int biBitCount, colorused, compressType;

  private boolean isError = false;

  private int getColorInt(byte b1, byte b2, byte b3)
  {
    return ((b3 & 0xff) << 16) | ((b2 & 0xff) << 8) | (b1 & 0xff) | 0xff000000;
  }

  private int[] getColorRLE8(byte[] data, int[] npalette, int index, int width, int height)
  {
    // the codes below deal with standard BI_RLE8 compression algorithm
    int originindex = index;
    int ny = height - 1;
    int nx = 0;
    int nCountByte, nRunByte;
    int cTmp;
    int[] ans = new int[height * width];
    boolean bEndDecoding = false;
    do
    {
      nCountByte = ((int) data[index++] & 0xff);
      if (nCountByte == 0)
      {
        nRunByte = ((int) data[index++] & 0xff);
        if (nRunByte > 2)
        {
          for (int i = 0; i < nRunByte; i++)
          {
            if (nx < width)
              ans[width * ny + (nx++)] = npalette[(int) data[index] & 0xff];
            index++;
          }
          if ((nRunByte & 0x1) == 1)
            index++;
        }
        else if (nRunByte == 0)
        {
          ny--;
          nx = 0;
        }
        else if (nRunByte == 1)
        {
          bEndDecoding = true;
        }
        else
        {
          nx += ((int) data[index++] & 0xff);
          ny -= ((int) data[index++] & 0xff);
        }
      }// end of (if(nCountByte == 0))
      else
      {
        cTmp = (int) data[index++] & 0xff;
        for (int i = 0; (i < nCountByte) && (nx < width); i++)
        {
          ans[width * ny + (nx++)] = npalette[cTmp];
        }
      }
    }
    while (!bEndDecoding && (ny >= 0));
    datafilesize = (index - originindex);
    return ans;
  }

  private void parse24bitData(byte[] data, int index)
  {
    if (compressType > 0)
    {
      isError = true;
      return;
    }
    colors = new int[width * height];
    // 4 byte align
    int padcount = (int) ((width * 3 + 3) / 4) * 4 - width * 3;
    for (int i = 0; i < height; i++)
    {
      for (int j = 0; j < width; j++)
      {
        colors[(height - i - 1) * width + j] = getColorInt(data[index], data[index + 1], data[index + 2]);
        index += 3;
      }
      index += padcount;
    }
    datafilesize = (width * 3 + padcount) * height;
  }

  private void parse8bitData(byte[] data, int index)
  {
    if (colorused == 0)
      colorused = 256;
    int npalette[] = new int[colorused];
    // read palette
    for (int i = 0; i < colorused; i++)
    {
      npalette[i] = getColorInt(data[index + i * 4], data[index + i * 4 + 1], data[index + i * 4 + 2]);
    }
    index += colorused * 4;
    if (compressType == 0)
    {
      int padcount = ((width + 3) / 4) * 4 - width;
      colors = new int[width * height];
      for (int i = 0; i < height; i++)
      {
        for (int j = 0; j < width; j++)
        {
          colors[(height - i - 1) * width + j] = npalette[(int) data[index] & 0xff];
          index++;
        }
        index += padcount;
      }
      datafilesize = (width + padcount) * height + colorused * 4;
    }
    else if (compressType == 1)
    {
      // BI_RLE8 compression algorithm
      colors = getColorRLE8(data, npalette, index, width, height);
      datafilesize += colorused * 4;
    }
    else
    {
      isError = true;
      return;
    }
  }

  private void parse4bitData(byte[] data, int index)
  {
    if (colorused == 0)
      colorused = 16;
    int npalette[] = new int[colorused];
    // read palette
    for (int i = 0; i < colorused; i++)
    {
      npalette[i] = getColorInt(data[index + i * 4], data[index + i * 4 + 1], data[index + i * 4 + 2]);
    }
    index += colorused * 4;
    if (compressType == 0)
    {
      int padcount = (((width + 1) / 2 + 3) / 4) * 4 - (width + 1) / 2;
      colors = new int[width * height];
      for (int i = 0; i < height; i++)
      {
        for (int j = 0; j < width / 2; j++)
        {
          colors[(height - i - 1) * width + 2 * j] = npalette[((int) data[index] >> 4) & 0x0f];
          colors[(height - i - 1) * width + 2 * j + 1] = npalette[(int) data[index] & 0x0f];
          index++;
        }
        if ((width & 0x1) != 0)
        {
          colors[(height - i - 1) * width + width - 1] = npalette[((int) data[index] >> 4) & 0x0f];
          index++;
        }
        index += padcount;
      }
      datafilesize = ((width + 1) / 2 + padcount) * height + colorused * 4;
    }
    else
    {
      // do not support
      isError = true;
      return;
    }
  }

  private void parse1bitData(byte[] data, int index)
  {
    if (colorused == 0)
      colorused = 2;
    int npalette[] = new int[colorused];
    // read palette
    for (int i = 0; i < colorused; i++)
    {
      npalette[i] = getColorInt(data[index + i * 4], data[index + i * 4 + 1], data[index + i * 4 + 2]);
    }
    index += colorused*4;
    int bitPerRow = ((int) (width + 31) / 32) * 32;
    int tmp = 0;
    colors = new int[width * height];
    for (int j = height - 1; j >= 0; j--)
    {
      for (int i = 0; i < bitPerRow; i++)
      {
        if ((i & 0x7) == 0)
        {
          tmp = (int) data[index++] & 0xff;
        }
        if (i >= width)
          continue;
        if (((128 >> (int) (i & 0x7)) & tmp) == 0)
          colors[j * width + i] = npalette[0];
        else
          colors[j * width + i] = npalette[1];
      }
    }
    datafilesize = (bitPerRow / 8) * height;
  }

  private void parseData(byte[] data, int index)
  {
    switch (biBitCount)
      {
        case 24 :
          // 24bits per pixel
          parse24bitData(data, index);
          return;
        case 8 :
          // 8bits per pixel
          parse8bitData(data, index);
          return;
        case 4 :
          // 4bits per pixel
          parse4bitData(data, index);
          return;
        case 1 :
          // 1bit per pixel
          parse1bitData(data, index);
          return;
        default:
          // do not support
          isError = true;
          return;
      }
  }

  public void parseBitmap(byte[] data, int index)
  {
    int headersize = 0;
    startindex = index;
    // skip the bitmap file header
    index += 14;

    // bitmap data header
    headersize = ByteUtil.readInt(data[index], data[index + 1], data[index + 2], data[index + 3]);
    if (headersize != 40)
    {
      isError = true;
      return;
    }
    width = ByteUtil.readInt(data[index + 4], data[index + 5], data[index + 6], data[index + 7]);
    height = ByteUtil.readInt(data[index + 8], data[index + 9], data[index + 10], data[index + 11]);
    biBitCount = ByteUtil.readWord(data[index + 14], data[index + 15]);
    compressType = ByteUtil.readInt(data[index + 16], data[index + 17], data[index + 18], data[index + 19]);
    colorused = ByteUtil.readInt(data[index + 32], data[index + 33], data[index + 34], data[index + 35]);
    index += 40;

    // bitmap data
    if (compressType == SVM_DEFLATE_COMPRESS)
    {
      // data is compressed
      int codedSize = ByteUtil.readInt(data[index], data[index + 1], data[index + 2], data[index + 3]);
      compressType = ByteUtil.readInt(data[index + 8], data[index + 9], data[index + 10], data[index + 11]);
      index += 12;
      byte codedData[] = new byte[codedSize];
      for (int i = 0; i < codedSize; ++i)
      {
        codedData[i] = data[index + i];
      }
      byte uncompressData[] = CompressUtil.decompress(codedData);
      parseData(uncompressData, 0);
      index += codedSize;
      filesize = index - startindex;// counted by bytes
    }
    else
    {
      // native data
      parseData(data, index);
      index += datafilesize;// datafilesize is set in parseData
      filesize = index - startindex;
    }
  }

  public int getReadByte()
  {
    return filesize;
  }

  public boolean isError()
  {
    return isError;
  }

  public int[] getColor()
  {
    return colors;
  }

  public int getWidth()
  {
    return width;
  }

  public int getHeight()
  {
    return height;
  }
}
