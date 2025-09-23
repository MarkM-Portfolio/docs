package com.ibm.concord.viewer.services.rest.handlers.job;

import java.io.File;

import com.ibm.concord.viewer.job.Job;
import com.ibm.concord.viewer.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.viewer.job.exception.JobExecutionException;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.repository.IRepositoryAdapter;

public class PostThumbnailJob extends Job
{

  public PostThumbnailJob(ImportDraftFromRepositoryContext jobContext)
  {
    super(jobContext);
  }

  @Override
  public String getDocumentId()
  {
    return null;
  }

  @Override
  public boolean hasUploadConversion()
  {
    return false;
  }

  @Override
  public void cleanFailure()
  {
   
  }

  @Override
  public Object exec() throws JobExecutionException
  {
    IRepositoryAdapter repository = 
        RepositoryServiceUtil.getRepositoryAdapter(RepositoryServiceUtil.TOSCANA_REPO_ID);
    
    try
    {
      ImportDraftFromRepositoryContext jContext = (ImportDraftFromRepositoryContext)this.getJobContext();
      repository.setThumbnail(null, jContext.mediaURI, String.valueOf(jContext.modified));
    }
    catch (RepositoryAccessException e)
    {
      throw new JobExecutionException(e.getStatusCode(), e);
    }   
    return "SUCCESS";
  }

  @Override
  public void putResult(Object result)
  {
    
  }

  @Override
  public File getResultFile()
  {
    // TODO Auto-generated method stub
    return null;
  }

}
