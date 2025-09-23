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

import com.ibm.concord.job.JobContext;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONObject;

public class ExportDraftToRepositoryContext extends JobContext
{
  public String mediaURI;

  public String customerId;

  public String sourceMime;

  public String targetMime;

  public long draftModified;

  public boolean asNewFile;

  public boolean needBackendPDF; // used to indicate whether to submit backend PDF export Job with the draft Publish job.
  
  public boolean overwrite; // if to overwrite current version, may not be support by some repositpry

  public UserBean requester;

  public UserBean getRequester()
  {
    return requester;
  }

  public IDocumentEntry docEntry;

  public JSONObject requestData;

  public DraftDescriptor draftDescriptor;

  public ExportDraftToRepositoryContext()
  {
    ;
  }

  protected String getJobIdString()
  {
    return mediaURI + customerId + draftModified + sourceMime + targetMime + asNewFile
        + ExportDraftToRepositoryContext.class.getSimpleName();
  }
}
