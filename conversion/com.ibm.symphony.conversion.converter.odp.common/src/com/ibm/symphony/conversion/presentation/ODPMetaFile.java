/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.Closeable;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.doc.OdfDocument;

public class ODPMetaFile extends FilterInputStream
{
  private static final String CLASS = ODPMetaFile.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS);

  public static final String OTHER_FILE_TYPE = "others";

  public static final String NOT_VALID_FILE = "not valid";

  public ODPMetaFile(InputStream in)
  {
    super(in);
  }

  @Override
  public long skip(long n) throws IOException
  {
    long total = 0;
    long cur = 0;

    while ((total < n) && ((cur = in.skip(n - total)) > 0))
    {
      total += cur;
    }

    return total;
  }

  public int readFully(byte[] buffer) throws IOException
  {
    int size = buffer.length;
    if (available() < size)
    {
      size = available();
    }
    int len = 0;
    for (int nRead = 0; nRead < size; nRead += len)
    {
      len = read(buffer, 0, size);
    }
    return size;
  }

  public int readWORD() throws IOException // return unsigned short
  {
    return readWord(read(), read());
  }

  public void readWORD(int[] buf) throws IOException // return unsigned short
  {
    for (int i = 0; i < buf.length; i++)
    {
      buf[i] = readWORD();
    }
  }

  public short readShort() throws IOException // return signed short
  {
    return (short) readWORD();
  }

  public long readDWORD() throws IOException // return unsigned int
  {
    return toUnsign(readInt());
  }

  public int readInt() throws IOException // return unsigned int
  {
    return readInt(read(), read(), read(), read());
  }

  public void readInt(int[] buf) throws IOException // return unsigned int
  {
    for (int i = 0; i < buf.length; i++)
    {
      buf[i] = readInt();
    }
  }

  public void readDWORD(long[] buf) throws IOException
  {
    for (int i = 0; i < buf.length; i++)
    {
      buf[i] = readDWORD();
    }
  }

  public int readUByte(byte[] b)
  {
    if (b == null)
    {
      return -1;
    }

    return b[0] & 0xff;
  }

  public int readWord(byte b1, byte b2)
  {
    return ((b2 & 0xff) << 8) | (b1 & 0xff);
  }

  public int readWord(int b1, int b2)
  {
    return ((b2 & 0xff) << 8) | (b1 & 0xff);
  }

  public int BLInt(int x)
  {
    return (x << 24) | ((x & 0x0000ff00) << 8) | ((x & 0x00ff0000) >> 8) | (x >>> 24);
  }

  public long toUnsign(int x)
  {
    return (0L | (x >>> 1)) << 1 | (x & 1);
  }

  public int BLWord(int x)
  {
    return ((x << 8) & 0xffff) | ((x >>> 8) & 0xff);
  }

  public short BLSignedWord(int x)
  {
    short tmp = (short) (((x << 8) & 0xffff) | ((x >>> 8) & 0xff));
    return tmp;
  }

  public int readInt(byte b1, byte b2, byte b3, byte b4)
  {
    return ((b4 & 0xff) << 24) | ((b3 & 0xff) << 16) | ((b2 & 0xff) << 8) | (b1 & 0xff);
  }

  public int readInt(int b1, int b2, int b3, int b4)
  {
    return ((b4 & 0xff) << 24) | ((b3 & 0xff) << 16) | ((b2 & 0xff) << 8) | (b1 & 0xff);
  }

  /**
   * Determines the file format for WMF, EMF, PNG, and SVM files
   * <p>
   * 
   * @param metafile
   *          Metafile to inspect
   * @return String File format type
   * 
   */
  public static String getFileType(File metafile)
  {
    String ret = OTHER_FILE_TYPE;
    ODPMetaFile file = null;
    try
    {
      file = new ODPMetaFile(new BufferedInputStream(new FileInputStream(metafile)));
      int tag1 = file.readInt();

      // =============== PNG ===============
      if (tag1 == 0x474e5089)
      {
        return ODPConvertConstants.FILE_PNG;
      }
      // =============== SVM ===============
      if (tag1 == 0x4d4c4356)
      {
        int tag2 = file.readInt() & 0x0000ffff;
        if (tag2 == 0x00004654)
        {
          return ODPConvertConstants.FILE_SVM;
        }
      }
      // ========== Placeable WMF ==========
      else if (tag1 == 0x9ac6cdd7)
      {
        return ODPConvertConstants.FILE_WMF;
      }
      // =============== EMF ===============
      else if (tag1 == 0x1)
      {
        file.skip(36L);
        int tag2 = file.readInt();
        if (tag2 == 0x464D4520)
        {
          return ODPConvertConstants.FILE_EMF;
        }
      }
      // ========== Standard WMF ===========
      else
      {
        int headerSize = (tag1 & 0xffff0000) >>> 16;
        int fileType = tag1 & 0xffff;

        if (!(fileType == 1 && headerSize == 9))
        {
          return ret;
        }
        else
        {
          return ODPConvertConstants.FILE_WMF;
        }
      }
    }
    catch (FileNotFoundException e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_ERROR_OPENING_FILE_ODF, metafile.getName());
      ODPCommonUtil.logMessage(Level.WARNING, message);
      return NOT_VALID_FILE;
    }
    catch (Exception e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".copyFile");
      ODPCommonUtil.logException(Level.WARNING, message, e);
      return NOT_VALID_FILE;
    }
    finally
    {
      closeResource(file);
    }
    return ret;
  }

  public static boolean copyFile(String sourceFileName, File targetDir, String targetName)
  {
    // Assume the directory was already created

    byte[] buf = new byte[4096];
    InputStream in = null;
    OutputStream out = null;
    String targetFullFileName = null;
    try
    {
      targetFullFileName = targetDir.getAbsolutePath() + File.separator + targetName;
      File targetFile = new File(targetFullFileName);
      if (targetFile.exists())
      {
        return false;
      }

      in = new BufferedInputStream(new FileInputStream(sourceFileName));

      out = new BufferedOutputStream(new FileOutputStream(targetFullFileName));

      if (LOG.isLoggable(Level.FINE))
      {
        LOG.fine(sourceFileName + " will be copied to " + targetFullFileName);
      }

      int len = 0;
      while ((len = in.read(buf)) > 0)
      {
        out.write(buf, 0, len);
      }

    }
    catch (FileNotFoundException e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_ERROR_OPENING_FILE_ODF, targetFullFileName);
      ODPCommonUtil.logMessage(Level.WARNING, message);
      return false;
    }
    catch (Exception e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".copyFile");
      ODPCommonUtil.logException(Level.WARNING, message, e);
      return false;
    }
    finally
    {
      closeResource(in);
      closeResource(out);
    }

    return true;
  }

  /*
   * Quietly and cleanly closes the Closeable object (Streams, Readers, etc) if it is still open
   * 
   * @param closeable Closeable object (Streams, Readers, etc)
   */
  public static void closeResource(Closeable closeable)
  {
    if (closeable != null)
    {
      try
      {
        closeable.close();
      }
      catch (IOException e)
      {
        String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".closeResource");
        ODPCommonUtil.logException(Level.WARNING, message, e);
      }
    }
  }
  
  /*
   * Quietly and cleanly closes the ODF document if it is still open
   * 
   * @param closeable ODF document
   */
  public static void closeResource(OdfDocument closeable)
  {
    if (closeable != null)
    {
        closeable.close();
    }
  }
}
