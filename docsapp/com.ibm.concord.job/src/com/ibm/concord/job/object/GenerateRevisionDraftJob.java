/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.job.object;

import java.io.File;
import java.io.IOException;

import com.ibm.concord.job.Job;
import com.ibm.concord.job.context.GenerateRevisionDraftContext;
import com.ibm.concord.job.exception.JobExecutionException;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.revision.exception.RevisionDataException;
import com.ibm.concord.revision.exception.RevisionStorageException;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.document.services.IDocumentServiceProvider;

public class GenerateRevisionDraftJob extends Job
{
  
  private GenerateRevisionDraftContext context;
  
  public GenerateRevisionDraftJob(GenerateRevisionDraftContext jobContext)
  {
    super(jobContext);
    context = jobContext;
  }

  @Override
  public Object exec() throws JobExecutionException
  {
    IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent("com.ibm.concord.document.services")
    .getService(IDocumentServiceProvider.class);
    IDocumentService docService = docServiceProvider.getDocumentService(context.docEntry.getMimeType());

    try
    {
      DraftDescriptor dd = docService.generateDraftForRevision(context.caller, context.docEntry, context.majorNo, context.minorNo);
      return dd;
    }
    catch (RevisionStorageException e)
    {
      throw new JobExecutionException(e.getErrorCode(), e);
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
      File resultFile = new File(context.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX);
      resultFile.createNewFile();      
    }
    catch (IOException e)
    {
      new File(context.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX).delete();
      putError(e);
    }
  }

  @Override
  public File getResultFile()
  {
    return new File(context.getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX);
  }
}
