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
import com.ibm.concord.spi.beans.IDocumentEntry;

public class ConvertDuringUploadContext extends JobContext
{
  public String mediaURI;

  public String sourceMime;

  public String targetMime;

  public long modified;

  public IDocumentEntry docEntry;
  
  public boolean isAdminUser;

  public ConvertDuringUploadContext()
  {
    
  }

  protected String getJobIdString()
  {
    if(docEntry != null && docEntry.getVersionSeriesId() != null && docEntry.getVersionSeriesUri() != null)
    {// use media size as modified for document has series ID as the document ID/Modfied changes when check out 
      modified = docEntry.getMediaSize();
      mediaURI = docEntry.getVersionSeriesUri();
    }

    return mediaURI + modified + sourceMime + targetMime + ConvertDuringUploadContext.class.getSimpleName();
  }
}
