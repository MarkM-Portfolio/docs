/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.job.object;

import java.io.File;
import java.io.IOException;

import com.ibm.concord.job.Job;
import com.ibm.concord.job.context.UploadContext;
import com.ibm.concord.job.exception.JobExecutionException;
import com.ibm.concord.platform.util.DocumentEntryHelper;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.repository.IRepositoryAdapter;
import com.ibm.docs.repository.RepositoryAccessException;

public class MediaUploadJob extends Job
{
//  private static final Logger LOGGER = Logger.getLogger(MediaUploadJob.class.getName());

  private UploadContext uc;

  private IRepositoryAdapter repositoryProvider;

  public MediaUploadJob(UploadContext uc, IRepositoryAdapter repositoryProvider)
  {
    super(uc);

    if (uc.mediaStream == null)
    {
      throw new NullPointerException();
    }

    if (uc.replace && uc.replaceMedia == null)
    {
      throw new IllegalStateException();
    }

    if (!uc.replace && (uc.folderURI == null || uc.folderType == null || uc.mediaLabel == null))
    {
      throw new IllegalStateException();
    }

    this.uc = uc;
    this.repositoryProvider = repositoryProvider;
  }

  public Object exec() throws JobExecutionException
  {
    File resultFile = new File(uc.getWorkingDir(), RESULT + ENTRY_RESULT_SUFFIX);
    if (resultFile.exists())
    {
      return resultFile;
    }

    Object result = null;

    try
    {
      if (uc.replace)
      {
        result = repositoryProvider.setContentStream(uc.requester, uc.replaceMedia, uc.mediaStream, null);
      }
      else
      {
        result = repositoryProvider.createDocument(uc.requester, uc.folderURI, uc.folderType, uc.mediaLabel, uc.mediaStream);
      }
    }
    catch (RepositoryAccessException e)
    {
      throw new JobExecutionException(String.valueOf(e.getErrCode()), e.getErrMsg(), null, e.getStatusCode(), e);
    }
    return result;
  }

  public void putResult(Object result)
  {
    if (result instanceof IDocumentEntry)
    {
      try
      {
        writeString2File(new File(uc.getWorkingDir(), RESULT + ENTRY_RESULT_SUFFIX), DocumentEntryHelper.toJSON((IDocumentEntry) result)
            .toString());
      }
      catch (IOException e)
      {
        new File(uc.getWorkingDir(), RESULT + ENTRY_RESULT_SUFFIX).delete();
        putError(e);
      }
    }
  }

  protected void putError(Throwable e)
  {
    errorFile = new File(uc.getWorkingDir(), Job.ERROR_RESULT);

    super.putError(e);
  }

  public File getResultFile()
  {
    return new File(uc.getWorkingDir(), RESULT + ENTRY_RESULT_SUFFIX);
  }
}
