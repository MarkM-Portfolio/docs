package com.ibm.concord.services.rest.util;

import com.ibm.concord.job.JobContext;
import com.ibm.concord.job.JobListener;
import com.ibm.concord.job.context.ExportDraftToRepositoryContext;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.spi.beans.IDocumentEntry;

public class ExportDraftListener implements JobListener
{

  public void aboutToSchedule(JobContext jobContext)
  {
    // TODO Auto-generated method stub
    
  }

  public boolean shouldSchedule(JobContext jobContext)
  {
    return true;
  }

  public void scheduled(JobContext jobContext)
  {
    ExportDraftToRepositoryContext listenedContext = (ExportDraftToRepositoryContext) jobContext;
    if(listenedContext != null)
    {
      IDocumentEntry docEntry = listenedContext.docEntry;
      if(docEntry != null)
      {
          DocumentSession docSess = SessionManager.getInstance().getSession(docEntry.getRepository(), docEntry.getDocUri());
          if(docSess != null)
          {
            docSess.setPublishing(true);
          }
      }
    }
  }

  public void joined(JobContext jobContext, boolean locally)
  {
    // TODO Auto-generated method stub
    
  }

  public void done(JobContext jobContext, boolean success)
  {
    ExportDraftToRepositoryContext listenedContext = (ExportDraftToRepositoryContext) jobContext;
    if(listenedContext != null)
    {
      IDocumentEntry docEntry = listenedContext.docEntry;
      if(docEntry != null)
      {
          DocumentSession docSess = SessionManager.getInstance().getSession(docEntry.getRepository(), docEntry.getDocUri());
          if(docSess != null)
          {
            docSess.setPublishing(false);
          }         
      }
    }
  }
}
