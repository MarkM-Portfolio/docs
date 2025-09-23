/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.job.object;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

import org.apache.commons.io.input.AutoCloseInputStream;

import com.ibm.concord.job.ConcordRESTFormatConverter;
import com.ibm.concord.job.FormatConversionException;
import com.ibm.concord.job.IFormatConverter;
import com.ibm.concord.job.IllegalConvertException;
import com.ibm.concord.job.Job;
import com.ibm.concord.job.MediaSizeExceededException;
import com.ibm.concord.job.MockFormatConverter;
import com.ibm.concord.job.context.ConversionContext;
import com.ibm.concord.job.exception.JobExecutionException;
import com.ibm.docs.common.io.ZipUtil;

public class MockConversionJob extends Job
{
//  private static final Logger LOGGER = Logger.getLogger(ConversionJob.class.getName());

  public static final int STREAM_MODE = 0;
  public static final int URI_MODE = 1;

  public static final int MINIMUM_TIMEOUT_IN_SECOND = 20;
  public static final int MAXIMUM_TIMEOUT_IN_SECOND = 60;

  private int timeoutInSec = 30;

  private ConversionContext cc;

  private IFormatConverter formatConverter;

  public MockConversionJob(ConversionContext cc)
  {
    super(cc);

    if (cc.mediaID == null)
    {
      throw new NullPointerException();
    }

    if (cc.mode != STREAM_MODE && cc.mode != URI_MODE)
    {
      throw new IllegalArgumentException();
    }

    this.cc = cc;
    this.timeoutInSec = (MINIMUM_TIMEOUT_IN_SECOND + MAXIMUM_TIMEOUT_IN_SECOND) / 2;

    if (Boolean.TRUE.toString().equals(System.getProperty(IFormatConverter.MOCK_CONVERSION)))
    {
      formatConverter = new MockFormatConverter();
    }
    else
    {
      formatConverter = new ConcordRESTFormatConverter();
    }
  }

  public Object exec() throws JobExecutionException
  {
    if (cc.mode == URI_MODE)
    {
      File resultFile1 = new File(cc.getWorkingDir(), RESULT + ZIP_RESULT_SUFFIX);
      if (resultFile1.exists())
      {
        return resultFile1;
      }

      File resultFile2 = new File(cc.getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX);
      if (resultFile2.exists())
      {
        return resultFile2;
      }
    }
    else if (cc.mode == STREAM_MODE)
    {
      File resultFile = new File(cc.getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX);
      if (resultFile.exists())
      {
        return resultFile;
      }
    }
    else
    {
      throw new JobExecutionException(-1, new IllegalStateException("N/A"));
    }

    Object result = null;
    String taskId = null;
    if (cc.mode == URI_MODE)
    {
      try
      {
        taskId = formatConverter.postConversionTask(cc.sourceMime, cc.targetMime, cc.mediaURI, cc.mediaLength);
      }
      catch (IllegalConvertException e)
      {
        throw new JobExecutionException(-1, new IllegalStateException("N/A"));
      }
      catch (FormatConversionException e)
      {
        throw new JobExecutionException(-1, new IllegalStateException("N/A"));
      }
      catch (MediaSizeExceededException e)
      {
        throw new JobExecutionException(-1, new IllegalStateException("N/A"));
      }
    }
    else if (cc.mode == STREAM_MODE)
    {
      try
      {
        taskId = formatConverter.postConversionTask(cc.sourceMime, cc.targetMime, cc.mediaStream, cc.mediaLength);
      }
      catch (IllegalConvertException e)
      {
        throw new JobExecutionException(-1, new IllegalStateException("N/A"));
      }
      catch (FormatConversionException e)
      {
        throw new JobExecutionException(-1, new IllegalStateException("N/A"));
      }
      catch (MediaSizeExceededException e)
      {
        throw new JobExecutionException(-1, new IllegalStateException("N/A"));
      }
    }
    else
    {
      throw new JobExecutionException(-1, new IllegalStateException("N/A"));
    }

    if (cc.mode == URI_MODE)
    {
      try
      {
        result = performConversionAsURI(taskId);
      }
      catch (IllegalConvertException e)
      {
        throw new JobExecutionException(-1, new IllegalStateException("N/A"));
      }
      catch (FormatConversionException e)
      {
        throw new JobExecutionException(-1, new IllegalStateException("N/A"));
      }
    }
    else if (cc.mode == STREAM_MODE)
    {
      try
      {
        result = performConversionAsStream(taskId);
      }
      catch (IllegalConvertException e)
      {
        throw new JobExecutionException(-1, new IllegalStateException("N/A"));
      }
      catch (FormatConversionException e)
      {
        throw new JobExecutionException(-1, new IllegalStateException("N/A"));
      }
    }
    else
    {
      throw new JobExecutionException(-1, new IllegalStateException("N/A"));
    }

    return result;
  }

  public void putResult(Object result)
  {
    if (cc.mode == URI_MODE && result instanceof String)
    {
      try
      {
        if (new File((String) result).isDirectory())
        {
          ZipUtil.zip((String) result, new File(cc.getWorkingDir(), RESULT + ZIP_RESULT_SUFFIX).getPath());
        }
        else
        {
          writeMedia2File(new File(cc.getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX), new AutoCloseInputStream(new FileInputStream(
              (String) result)));
        }
      }
      catch (IOException e)
      {
        new File(cc.getWorkingDir(), RESULT + ZIP_RESULT_SUFFIX).delete();
        new File(cc.getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX).delete();
        putError(e);
      }
      catch (Exception e)
      {
        new File(cc.getWorkingDir(), RESULT + ZIP_RESULT_SUFFIX).delete();
        new File(cc.getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX).delete();
        putError(e);
      }
    }
    else if (cc.mode == STREAM_MODE && result instanceof InputStream)
    {
      try
      {
        writeMedia2File(new File(cc.getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX), (InputStream) result);
      }
      catch (IOException e)
      {
        new File(cc.getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX).delete();
        putError(e);
      }
    }
    else if (result instanceof File)
    {
      ;
    }
    else
    {
      throw new IllegalStateException();
    }
  }

  private String performConversionAsURI(String taskId) throws IllegalConvertException, FormatConversionException
  {
    int count = 0;
    boolean timeout = false;
    String after = null;

    while (timeout || (after = formatConverter.getConversionResultAsURI(taskId)) == null)
    {
      try
      {
        Thread.sleep(1000);
        if (count++ >= timeoutInSec)
        {
          Thread.interrupted();
        }
      }
      catch (InterruptedException e)
      {
        throw new FormatConversionException(new IllegalStateException("timeout when waiting conversion response."));
      }
    }

    return after;
  }

  private InputStream performConversionAsStream(String taskId) throws IllegalConvertException, FormatConversionException
  {
    int count = 0;
    boolean timeout = false;
    InputStream after = null;

    while (timeout || (after = formatConverter.getConversionResultAsStream(taskId)) == null)
    {
      try
      {
        Thread.sleep(1000);
        if (count++ >= timeoutInSec)
        {
          Thread.interrupted();
        }
      }
      catch (InterruptedException e)
      {
        throw new FormatConversionException(new IllegalStateException("timeout when waiting conversion response."));
      }
    }

    return after;
  }

  public File getResultFile()
  {
    if (cc.mode == URI_MODE)
    {
      File resultFile1 = new File(cc.getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX);
      File resultFile2 = new File(cc.getWorkingDir(), RESULT + ZIP_RESULT_SUFFIX);
      if (resultFile1.exists())
      {
        return resultFile1;
      }
      else if (resultFile2.exists())
      {
        return resultFile2;
      }
      else
      {
        throw new IllegalStateException();
      }
    }
    else if (cc.mode == STREAM_MODE)
    {
      return new File(cc.getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX);
    }
    else
    {
      throw new IllegalStateException();
    }
  }  
}
