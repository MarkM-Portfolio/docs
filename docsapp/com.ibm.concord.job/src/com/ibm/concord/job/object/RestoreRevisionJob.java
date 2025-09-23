package com.ibm.concord.job.object;

import java.io.File;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.job.Job;
import com.ibm.concord.job.context.RestoreRevisionContext;
import com.ibm.concord.job.exception.JobExecutionException;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.revision.exception.RevisionDataException;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.document.services.IDocumentServiceProvider;

public class RestoreRevisionJob extends Job
{
  private static final Logger LOGGER = Logger.getLogger(RestoreRevisionJob.class.getName());
  private static final String RESULT_FILE_NAME = RESULT + ENTRY_RESULT_SUFFIX;
  private RestoreRevisionContext context;

  public RestoreRevisionJob(RestoreRevisionContext jobContext)
  {
    super(jobContext);
    context = jobContext;
  }

  @Override
  public Object exec() throws JobExecutionException
  {
    LOGGER.entering(RestoreRevisionJob.class.getName(), "exec");

    File resultFile = new File(context.getWorkingDir(), RESULT_FILE_NAME);
    if (resultFile.exists())
    {
      if(!resultFile.delete())
      {
        LOGGER.log(Level.WARNING, "failed to delete file " + resultFile.getAbsolutePath());
      }
    }
    
    IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent("com.ibm.concord.document.services")
    .getService(IDocumentServiceProvider.class);
    IDocumentService docService = docServiceProvider.getDocumentService(context.docEntry.getMimeType());
 
    DraftDescriptor dd;
    try
    {
      dd = docService.restoreDraftFromRevision(context.caller, context.docEntry, context.majorNo, context.minorNo);
      return dd;
    }
    catch (RevisionDataException e)
    {
      throw new JobExecutionException(e.getErrorCode(), e);
    }
    catch (Exception e)
    {      
      throw new JobExecutionException(-1, e);
    }      
  }

  @Override
  public void putResult(Object result)
  {
    try
    {
      File resultFile = new File(context.getWorkingDir(), RESULT_FILE_NAME);
      resultFile.createNewFile();      
    }
    catch (IOException e)
    {
      new File(context.getWorkingDir(), RESULT_FILE_NAME).delete();
      putError(e);
    }
  }

  @Override
  public File getResultFile()
  {   
    return new File(context.getWorkingDir(), RESULT_FILE_NAME);
  }

}
