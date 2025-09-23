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

public class UploadContext extends JobContext
{
  public InputStream mediaStream;

  public boolean replace;

  public String folderURI;

  public String folderType;

  public String mediaLabel;

  public IDocumentEntry replaceMedia;

  public long lastModified;

  public UploadContext()
  {
    super();
  }

  public UploadContext(String workingDir)
  {
    super(workingDir);
  }

  protected String getJobIdString()
  {
    String jobString = "";
    if (replace)
    {
      jobString = replaceMedia.getDocUri() + lastModified + UploadContext.class.getSimpleName();
    }
    else
    {
      jobString = folderURI + folderType + mediaLabel + UploadContext.class.getSimpleName();
    }
    return jobString;
  }
}
