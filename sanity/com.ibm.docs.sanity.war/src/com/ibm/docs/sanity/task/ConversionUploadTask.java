package com.ibm.docs.sanity.task;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.io.input.AutoCloseInputStream;

import com.ibm.docs.sanity.util.PathUtil;

public class ConversionUploadTask
{
  private static final Logger LOG = Logger.getLogger(ConversionUploadTask.class.getName());

  private String targetFolder;

  public ConversionUploadTask(String targetFolder)
  {
    if (targetFolder == null)
    {
      throw new NullPointerException();
    }
    this.targetFolder = targetFolder;
  }

  public String upload()
  {
    LOG.entering(ConversionUploadTask.class.getName(), "upload");

    String path = null;
    InputStream docStream = new AutoCloseInputStream(ConversionUploadTask.class.getResourceAsStream("/check_data/test.odt"));
    try
    {
      File targetFilefolder = new File(targetFolder);
      if (!targetFilefolder.exists())
      {
        targetFilefolder.mkdirs();
      }
      File docFile = new File(targetFolder, "test.odt");
      copy(docStream, docFile);
      path = new PathUtil(targetFolder, "/test.odt").resolveToAbsolutePath();
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "Failed to copy sample file to {0}. {1}", new Object[] { targetFolder, e });
      return path;
    }

    LOG.exiting(ConversionUploadTask.class.getName(), "upload");
    return path;
  }

  private void copy(InputStream sourceStream, File destFile) throws IOException
  {
    LOG.entering(ConversionUploadTask.class.getName(), "copy", destFile);
    
    OutputStream os = null;
    try
    {
      os = new BufferedOutputStream(new FileOutputStream(destFile));
      byte[] bytes = new byte[4096];
      int readLength = 0;
      while ((readLength = sourceStream.read(bytes)) != -1)
      {
        os.write(bytes, 0, readLength);
      }
    }
    finally
    {
      if (os != null)
      {
        os.close();
      }
    }

    LOG.exiting(ConversionUploadTask.class.getName(), "copy");
  }
}