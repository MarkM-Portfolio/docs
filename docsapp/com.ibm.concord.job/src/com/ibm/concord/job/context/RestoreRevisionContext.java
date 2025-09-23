package com.ibm.concord.job.context;

import com.ibm.concord.job.JobContext;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.directory.beans.UserBean;

public class RestoreRevisionContext extends JobContext
{
  public IDocumentEntry docEntry;

  public UserBean caller;

  public int majorNo;

  public int minorNo;
  
  private final String JOB_ID_SUFFIX = "restorejob";

  @Override
  protected String getJobIdString()
  {
    return docEntry.getRepository() + docEntry.getDocId() + JOB_ID_SUFFIX + RestoreRevisionContext.class.getSimpleName();
  }

}
