package com.ibm.concord.job.context;

import com.ibm.concord.job.JobContext;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.directory.beans.UserBean;

public class GenerateRevisionDraftContext extends JobContext
{
  public IDocumentEntry docEntry;

  public UserBean caller;

  public int majorNo;

  public int minorNo;

  @Override
  protected String getJobIdString()
  {
    return docEntry.getRepository() + docEntry.getDocId() + majorNo + minorNo + GenerateRevisionDraftContext.class.getSimpleName();
  }
}
