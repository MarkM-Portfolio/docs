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

import com.ibm.concord.job.JobContext;
import com.ibm.concord.spi.beans.IDocumentEntry;

public class ConversionUploadContext extends JobContext
{
  public ConversionUploadContext()
  {
    super();
  }

  public String sourceMime;

  public String targetMime;

  public String mediaURI;

  public String mediaID;

  public long modified;

  public InputStream mediaStream;

  public boolean replace;

  public String folderURI;

  public String folderType;

  public String mediaLabel;

  public IDocumentEntry replaceMedia;

  protected String getJobIdString()
  {
    if (replace)
    {
      return mediaID + modified + sourceMime + targetMime + replaceMedia.getDocUri() + ConversionUploadContext.class.getSimpleName();
    }
    else
    {
      return mediaID + modified + sourceMime + targetMime + folderURI + folderType + mediaLabel
          + ConversionUploadContext.class.getSimpleName();
    }
  }
}
