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

import java.util.Iterator;
import java.util.Map;

import com.ibm.concord.job.JobContext;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.directory.beans.UserBean;

public class ConvertDraftMediaContext extends JobContext
{
  public String mediaURI;

  public String sourceMime;

  public String targetMime;

  public String targetExtension;

  public long draftModified;

  public Map<String, Object> options;

  public UserBean requester;

  public DraftDescriptor draftDesp;

  public IDocumentEntry docEntry;

  public ConvertDraftMediaContext()
  {
    ;
  }

  protected String getJobIdString()
  {
    StringBuffer sb = new StringBuffer();
    if (options != null)
    {
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
    }
    return mediaURI + draftModified + sourceMime + targetMime + sb.toString() + ConvertDraftMediaContext.class.getSimpleName();
  }

}
