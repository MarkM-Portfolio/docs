package com.ibm.docs.viewer.automation.util;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.channels.FileChannel;
import java.util.logging.Level;
import java.util.logging.Logger;

public class FileUtil
{
  private static final Logger logger = Logger.getLogger(FileUtil.class.getName());

  public static String readFile(String path)
  {
    byte[] buffer = new byte[(int) new File(path).length()];
    try
    {
      BufferedInputStream is = new BufferedInputStream(new FileInputStream(path));
      is.read(buffer);
      is.close();
    }
    catch (IOException e)
    {
      logger.log(Level.WARNING, "Failed to read file: " + path, e.getMessage());
      return null;
    }
    return new String(buffer);
  }

  public static boolean copy(File src, File desc)
  {
    boolean succ = true;
    FileInputStream fis = null;
    FileOutputStream fos = null;
    FileChannel fic = null;
    FileChannel foc = null;
    try
    {
      long p = 0, dp, size;
      fos = new FileOutputStream(desc);
      fis = new FileInputStream(src);
      fic = fis.getChannel();
      foc = fos.getChannel();
      size = fic.size();
      while ((dp = foc.transferFrom(fic, p, size)) > 0)
      {
        p += dp;
      }
    }
    catch (FileNotFoundException e)
    {
      logger.log(Level.WARNING,
          "Copy file failed.  From: " + src.getAbsolutePath() + ".  To: " + desc.getAbsolutePath() + ".  " + e.getMessage());
      succ = false;
    }
    catch (IOException e)
    {
      logger.log(Level.WARNING,
          "Copy file failed.  From: " + src.getAbsolutePath() + ".  To: " + desc.getAbsolutePath() + ".  " + e.getMessage());
      succ = false;
    }
    finally
    {
      if (fic != null)
      {
        try
        {
          fic.close();
        }
        catch (IOException e)
        {
          logger.warning(e.getMessage());
        }
      }
      if (foc != null)
      {
        try
        {
          foc.close();
        }
        catch (IOException e)
        {
          logger.warning(e.getMessage());
        }
      }
      if (fis != null)
      {
        try
        {
          fis.close();
        }
        catch (IOException e)
        {
          logger.warning(e.getMessage());
        }
      }
      if (fos != null)
      {
        try
        {
          fos.close();
        }
        catch (IOException e)
        {
          logger.warning(e.getMessage());
        }
      }
    }
    return succ;
  }

}
