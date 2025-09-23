/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.job;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.spi.beans.UserBean;

public abstract class JobContext
{
  protected static final Logger LOGGER = Logger.getLogger(JobContext.class.getName());

  public UserBean requester;

  private String workingDir;

  private boolean headless;

  public JobContext()
  {
    this.workingDir = null;
  }

  public JobContext(String workingDir)
  {
    if (!new File(workingDir).exists() || !new File(workingDir).isDirectory())
    {
      throw new IllegalArgumentException();
    }

    this.workingDir = workingDir;
  }

  public abstract String getJobId();

  public boolean getHeadless()
  {
    return headless;
  }

  public void setHeadless(boolean headless)
  {
    this.headless = headless;
  }

  public File getWorkingDir()
  {
    if (workingDir == null)
    {
      throw new NullPointerException("The working dir is not set for Job");
    }
   
    return new File(workingDir);
  }

  public void setWorkingDir(File workingDir)
  {
    if (!workingDir.exists() || !workingDir.isDirectory())
    {
      throw new IllegalArgumentException();
    }

    this.workingDir = workingDir.getPath();
  }

  protected String MD5(String eigenvalue)
  {
    try
    {
      if (headless)
      {
        eigenvalue += UUID.randomUUID().toString();
      }

      return getHexString(MessageDigest.getInstance("MD5").digest(eigenvalue.getBytes()));
    }
    catch (NoSuchAlgorithmException e)
    {
      LOGGER.log(Level.WARNING, "Can not find Java MD5 algorithm, job cache have to be disabled.", e);
      return UUID.randomUUID().toString();
    }
    catch (UnsupportedEncodingException e)
    {
      LOGGER.log(Level.WARNING, "Calculate Job ID MD5 failed, job cache have to be disabled.", e);
      return UUID.randomUUID().toString();
    }
  }

  private String getHexString(byte[] raw) throws UnsupportedEncodingException
  {
    byte[] HEX_CHAR_TABLE =
    {
        (byte)'0', (byte)'1', (byte)'2', (byte)'3',
        (byte)'4', (byte)'5', (byte)'6', (byte)'7',
        (byte)'8', (byte)'9', (byte)'a', (byte)'b',
        (byte)'c', (byte)'d', (byte)'e', (byte)'f'
    };

    byte[] hex = new byte[2 * raw.length];
    int index = 0;

    for (byte b : raw) 
    {
      int v = b & 0xFF;
      hex[index++] = HEX_CHAR_TABLE[v >>> 4];
      hex[index++] = HEX_CHAR_TABLE[v & 0xF];
    }
    return new String(hex, "ASCII");
  }
}
