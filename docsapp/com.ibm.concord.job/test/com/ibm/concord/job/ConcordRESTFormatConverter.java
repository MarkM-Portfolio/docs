/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.job;

import java.io.IOException;
import java.io.InputStream;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpException;
import org.apache.commons.httpclient.MultiThreadedHttpConnectionManager;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.multipart.FilePart;
import org.apache.commons.httpclient.methods.multipart.MultipartRequestEntity;
import org.apache.commons.httpclient.methods.multipart.Part;
import org.apache.commons.httpclient.methods.multipart.PartSource;
import org.apache.commons.httpclient.methods.multipart.StringPart;
import org.apache.commons.io.input.AutoCloseInputStream;

public class ConcordRESTFormatConverter implements IFormatConverter
{
  private static final Logger LOG = Logger.getLogger(ConcordRESTFormatConverter.class.getName());

  private static MultiThreadedHttpConnectionManager clientsManager;

  private static final String JOB_ID = "JOBID";
  private static final String CONVERSION_ERRORS = "CONVERSIONERRORS";
  private static final String CONVERSION_WARNINGS = "CONVERSION_WARNINGS";
  private static final String SOURCE_MIME_TYPE = "sourceMIMEType";
  private static final String TARGET_MIME_TYPE = "targetMIMEType";
  private static final String MEDIA_LENGTH = "mediaLength";
  private static final String SOURCE_MEDIA_URI = "filePath";
  private static final String TARGET_MEDIA_URI = "targetPath";
  private static final String RETURN_PATH = "returnPath";

  public ConcordRESTFormatConverter()
  {
    clientsManager = new MultiThreadedHttpConnectionManager();
    clientsManager.getParams().setDefaultMaxConnectionsPerHost(100);
    clientsManager.getParams().setMaxTotalConnections(1000);
  }

  public InputStream getConversionResultAsStream(String jobId) throws IllegalConvertException, FormatConversionException
  {
    InputStream is = null;
    String taskResultURL = generateConverstionServiceURL(jobId);
    HttpClient client = new HttpClient(clientsManager);
    GetMethod getTaskResultMethod = new GetMethod(taskResultURL);

    try
    {
      int ret = client.executeMethod(getTaskResultMethod);
      if (200 == ret) // Task completed. 
      {
        is = new AutoCloseInputStream(getTaskResultMethod.getResponseBodyAsStream());
      }
      else if (220 == ret)
      {
        is = new AutoCloseInputStream(getTaskResultMethod.getResponseBodyAsStream());
        LOG.log(Level.WARNING, getTaskResultMethod.getResponseHeader(CONVERSION_ERRORS).getValue()); // FIXME, how should we handle conversion error?
        LOG.log(Level.WARNING, getTaskResultMethod.getResponseHeader(CONVERSION_WARNINGS).getValue()); // FIXME, how should we handle conversion error?
      }
      else if (221 == ret) // Task in progress.
      {
        is = null;
      }
      else if (424 == ret) // Job ID not found.
      {
        throw new FormatConversionException(new IllegalStateException("Conversion task id not found."));
      }
      else if (520 == ret) // General conversion error.
      {
        throw new FormatConversionException();
      }
      else // 400, 500, 503
      {
        throw new FormatConversionException(new IllegalStateException());
      }
    }
    catch (HttpException e)
    {
      throw new FormatConversionException(new IllegalStateException());
    }
    catch (IOException e)
    {
      throw new FormatConversionException(new IllegalStateException());
    }

    return is;
  }

  public String getConversionResultAsURI(String jobId) throws IllegalConvertException, FormatConversionException
  {
    String filePath = null;
    String taskResultURL = generateConverstionServiceURL(jobId);
    HttpClient client = new HttpClient(clientsManager);
    GetMethod getTaskResultMethod = new GetMethod(taskResultURL);
    getTaskResultMethod.addRequestHeader(RETURN_PATH, "true");

    try
    {
      int ret = client.executeMethod(getTaskResultMethod);
      if (200 == ret) // Task completed. 
      {
        filePath = getTaskResultMethod.getResponseHeader(TARGET_MEDIA_URI).getValue();
      }
      else if (220 == ret)
      {
        filePath = getTaskResultMethod.getResponseHeader(TARGET_MEDIA_URI).getValue();
        LOG.log(Level.WARNING, getTaskResultMethod.getResponseHeader(CONVERSION_ERRORS).getValue()); // FIXME, how should we handle conversion error?
        LOG.log(Level.WARNING, getTaskResultMethod.getResponseHeader(CONVERSION_WARNINGS).getValue()); // FIXME, how should we handle conversion error?
      }
      else if (221 == ret) // Task in progress.
      {
        filePath = null;
      }
      else if (424 == ret) // Job ID not found.
      {
        throw new FormatConversionException(new IllegalStateException("Conversion task id not found."));
      }
      else if (520 == ret) // General conversion error.
      {
        throw new FormatConversionException();
      }
      else // 400, 500, 503
      {
        throw new FormatConversionException(new IllegalStateException());
      }
    }
    catch (HttpException e)
    {
      throw new FormatConversionException(new IllegalStateException());
    }
    catch (IOException e)
    {
      throw new FormatConversionException(new IllegalStateException());
    }

    return filePath;
  }

  public String postConversionTask(final String sourceMime, String targetMime, final InputStream mediaStream, final long mediaLength)
      throws IllegalConvertException, FormatConversionException, MediaSizeExceededException
  {
    String taskId = null;
    String taskResultURL = generateConverstionServiceURL(taskId);
    HttpClient client = new HttpClient(clientsManager);
    PostMethod postTaskMethod = new PostMethod(taskResultURL);

    /*
     * Here is non-multipart implementation, which had been deprecated since V2 design of Conversion services.
     */
//    postTaskMethod.addRequestHeader(SOURCE_MIME_TYPE, fromFormatExt);
//    postTaskMethod.addRequestHeader(TARGET_MIME_TYPE, toFormatExt);
//    postTaskMethod.addRequestHeader(MEDIA_LENGTH, toFormatExt);
//    postTaskMethod.setRequestEntity(new InputStreamRequestEntity(is, contentLength));

    StringBuffer sb = new StringBuffer();
    sb.append(SOURCE_MIME_TYPE);
    sb.append('=');
    sb.append(sourceMime);
    sb.append(TARGET_MIME_TYPE);
    sb.append('=');
    sb.append(targetMime);
    sb.append(MEDIA_LENGTH);
    sb.append('=');
    sb.append(mediaLength);

    Part[] parts = new Part[] { new StringPart("ConversionParams", sb.toString()), new FilePart("media", new PartSource()
    {
      public InputStream createInputStream() throws IOException
      {
        return mediaStream;
      }

      public String getFileName()
      {
        return "";
      }

      public long getLength()
      {
        return mediaLength;
      }
    }) };
    postTaskMethod.setRequestEntity(new MultipartRequestEntity(parts, postTaskMethod.getParams()));

    try
    {
      int ret = client.executeMethod(postTaskMethod);
      if (202 == ret)
      {
        taskId = postTaskMethod.getResponseHeader(JOB_ID).getValue();
      }
      else if (406 == ret)
      {
        throw new IllegalConvertException();
      }
      else if (411 == ret)
      {
        throw new FormatConversionException(new IllegalStateException("Not given content length."));
      }
      else if (413 == ret)
      {
        throw new MediaSizeExceededException();
      }
      else if (520 == ret) // General conversion error.
      {
        throw new FormatConversionException();
      }
      else // 400, 500, 503
      {
        throw new FormatConversionException(new IllegalStateException());
      }
    }
    catch (HttpException e)
    {
      throw new FormatConversionException(new IllegalStateException());
    }
    catch (IOException e)
    {
      throw new FormatConversionException(new IllegalStateException());
    }

    return taskId;
  }

  public String postConversionTask(final String sourceMime, String targetMime, String mediaUri, final long mediaLength)
      throws IllegalConvertException, FormatConversionException, MediaSizeExceededException
  {
    String taskId = null;
    String taskResultURL = generateConverstionServiceURL(taskId);
    HttpClient client = new HttpClient(clientsManager);
    PostMethod postTaskMethod = new PostMethod(taskResultURL);
    postTaskMethod.addRequestHeader(SOURCE_MIME_TYPE, sourceMime);
    postTaskMethod.addRequestHeader(TARGET_MIME_TYPE, targetMime);
    postTaskMethod.addRequestHeader(SOURCE_MEDIA_URI, mediaUri);

    try
    {
      int ret = client.executeMethod(postTaskMethod);
      if (202 == ret)
      {
        taskId = postTaskMethod.getResponseHeader(JOB_ID).getValue();
      }
      else if (406 == ret)
      {
        throw new IllegalConvertException();
      }
      else if (411 == ret)
      {
        throw new FormatConversionException(new IllegalStateException("Not given content length."));
      }
      else if (413 == ret)
      {
        throw new MediaSizeExceededException();
      }
      else if (520 == ret) // General conversion error.
      {
        throw new FormatConversionException();
      }
      else // 400, 500, 503
      {
        throw new FormatConversionException(new IllegalStateException());
      }
    }
    catch (HttpException e)
    {
      throw new FormatConversionException(new IllegalStateException());
    }
    catch (IOException e)
    {
      throw new FormatConversionException(new IllegalStateException());
    }

    return taskId;
  }

  private String generateConverstionServiceURL(String taskId)
  {
    return null; // TODO, this url need to get from config or somewhere other place.
  }

}