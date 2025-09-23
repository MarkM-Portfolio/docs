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

import java.util.Map;
import java.util.TreeMap;

import com.ibm.concord.job.JobContext;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.directory.beans.UserBean;

public class ConvertRepositoryMediaContext extends JobContext
{
  public String mediaURI;

  public String sourceMime;

  public String targetMime;

  public String targetExtension;

  public long modified;

  public Map<String, Object> options;

  public UserBean requester;

  public IDocumentEntry docEntry;

  public ConvertRepositoryMediaContext()
  {
    ;
  }

  protected String getJobIdString()
  {
    StringBuffer sb = new StringBuffer();

    if (options != null)
    {
      // Need to sort the options per Keys, else there will be error cache hit when same values for different option keys
      Map<String, Object> copy = new TreeMap<String, Object>(options);
      for (Map.Entry<String, Object> entry : copy.entrySet())
      {
        Object obj = entry.getValue();
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
    }

    return mediaURI + modified + sourceMime + targetMime + sb.toString() + ConvertRepositoryMediaContext.class.getSimpleName();
  }
}
