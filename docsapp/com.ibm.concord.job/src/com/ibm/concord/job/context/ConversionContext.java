/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.job.context;

import java.io.InputStream;
import java.util.Iterator;
import java.util.Map;

import com.ibm.concord.job.JobContext;
import com.ibm.concord.job.object.ConversionJob;

public class ConversionContext extends JobContext
{
  public ConversionContext()
  {
    ;
  }

  public ConversionContext(String workingDir)
  {
    super(workingDir);
  }

  public String sourceMime;

  public String targetMime;

  public long mediaLength;

  public String mediaID;

  public long lastModified;

  public int mode = ConversionJob.URI_MODE;

  public Map<String, Object> options;

  public String mediaURI;

  public InputStream mediaStream;

  protected String getJobIdString()
  {
    if (options == null)
    {
      return mediaID + lastModified + mode + sourceMime + targetMime + ConversionContext.class.getSimpleName();
    }
    else
    {
      StringBuffer sb = new StringBuffer();
      Iterator<Object> iter = options.values().iterator();
      while (iter.hasNext())
      {
        Object obj = iter.next();
        if (obj instanceof String[])
        {
          for (int i = 0; i < ((String[]) obj).length; i++)
          {
            sb.append(((String[]) obj)[i]);
          }
        }
        else if (obj instanceof String)
        {
          sb.append(obj);
        }
        else
        {
          ;
        }
      }
      return mediaID + lastModified + mode + sourceMime + targetMime + sb.toString() + ConversionContext.class.getSimpleName();
    }
  }
}
