/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.job.context;

import java.util.logging.Level;

import com.ibm.concord.viewer.cache.spi.impl.ThumbnailDescriptor;
import com.ibm.concord.viewer.job.JobContext;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;

public class ImportDraftFromRepositoryContext extends JobContext
{
  public String mediaURI;
  public String sourceMime;
  public String targetMime;
  public long modified;

  public UserBean requester;
  public IDocumentEntry docEntry;
  public ICacheDescriptor draftDescriptor;

  public ThumbnailDescriptor thumbnailDesc;

  public boolean isHTML;
  public boolean forceSave;
  
  public String thumbnailServiceCachedDir;

  protected String jobId;
  
  public String userAgent;
  
  public String mode;
  
  public String password;
  
  public boolean isPromptPassword = false;

  public ImportDraftFromRepositoryContext()
  {
    isHTML = false;
  }
  
  public ImportDraftFromRepositoryContext(String workingDir)
  {
    super(workingDir);
  }
  public String getJobId()
  {
    if (jobId != null)
    {
      return jobId;
    }
    else
    {
      jobId = MD5(mediaURI + sourceMime + targetMime + ImportDraftFromRepositoryContext.class.getSimpleName()+isHTML);
      LOGGER.log(Level.FINE, "Generate JobID:" + jobId + " mediaURI:" + mediaURI + " modified:" + modified + " sourceMime:" + sourceMime
          + " targetMime:" + targetMime);
      return jobId;
    }
  } 
}
