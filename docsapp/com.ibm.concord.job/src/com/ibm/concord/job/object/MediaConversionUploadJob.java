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
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;

import org.apache.commons.io.input.AutoCloseInputStream;

import com.ibm.concord.job.Job;
import com.ibm.concord.job.context.ConversionContext;
import com.ibm.concord.job.context.ConversionUploadContext;
import com.ibm.concord.job.context.UploadContext;
import com.ibm.concord.job.exception.JobExecutionException;
import com.ibm.concord.platform.util.DocumentEntryHelper;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.common.io.ZipUtil;
import com.ibm.docs.repository.IRepositoryAdapter;

public class MediaConversionUploadJob extends Job
{
  private ConversionUploadContext cuc;
  private IRepositoryAdapter repositoryProvider;

  private Job conversionJob;
  private Job mediaUploadJob;

  public MediaConversionUploadJob(ConversionUploadContext cuc, IRepositoryAdapter repositoryProvider)
  {
    super(cuc);

    this.cuc = cuc;
    this.repositoryProvider = repositoryProvider;
  }

  public Object exec() throws JobExecutionException
  {
    File resultFile = new File(cuc.getWorkingDir(), RESULT + ENTRY_RESULT_SUFFIX);
    if (resultFile.exists())
    {
      return resultFile;
    }

    ConversionContext cc = new ConversionContext(cuc.getWorkingDir().getPath());
    cc.mode = ConversionJob.URI_MODE;
    cc.targetMime = cuc.targetMime;
    cc.sourceMime = cuc.sourceMime;
    cc.mediaID = cuc.mediaID;
    cc.lastModified = cuc.modified;
    cc.mediaLength = new File(cuc.mediaURI).length();
    cc.mediaURI = cuc.mediaURI;

    if (new File(cuc.mediaURI).isFile() && cuc.mediaURI.endsWith(ZIP_RESULT_SUFFIX))
    {
      try
      {
        ZipUtil.unzip(cuc.mediaURI, cc.getWorkingDir().getPath());
        cc.mediaURI = cc.getWorkingDir().getPath();
      }
      catch (Exception e)
      {
        throw new JobExecutionException(-1, e);
      }
    }

    conversionJob = new ConversionJob(cc);
    conversionJob.schedule();

    try
    {
      conversionJob.join();
    }
    catch (InterruptedException e)
    {
      throw new JobExecutionException(-1, e);
    }

    JobExecutionException je = conversionJob.getError();
    if (je == null)
    {
      File uploadingFile = conversionJob.getResultFile();
      if (uploadingFile.getName().endsWith(ZIP_RESULT_SUFFIX))
      {
        // No requirement to support ZIP conversion result until now.
        throw new JobExecutionException(-1, new IllegalStateException("MediaConversionUploadJob only supports converted file in "
            + MEDIA_RESULT_SUFFIX));
      }
      else if (uploadingFile.getName().endsWith(MEDIA_RESULT_SUFFIX))
      {
        ;
      }
      else
      {
        throw new JobExecutionException(-1, new IllegalStateException("MediaConversionUploadJob only supports converted file in "
            + MEDIA_RESULT_SUFFIX));
      }

      UploadContext uc = new UploadContext(cuc.getWorkingDir().getPath());
      uc.requester = cuc.requester;
      uc.replace = cuc.replace;
      try
      {
        uc.mediaStream = new AutoCloseInputStream(new FileInputStream(uploadingFile));
      }
      catch (FileNotFoundException e)
      {
        throw new JobExecutionException(-1, e);
      }

      if (cuc.replace)
      {
        uc.replaceMedia = cuc.replaceMedia;
        uc.lastModified = cuc.modified;
      }
      else
      {
        uc.folderType = cuc.folderType;
        uc.folderURI = cuc.folderURI;
        uc.mediaLabel = cuc.mediaLabel;
      }

      mediaUploadJob = new MediaUploadJob(uc, repositoryProvider);
      mediaUploadJob.config = config;
      mediaUploadJob.schedule();
      try
      {
        mediaUploadJob.join();
      }
      catch (InterruptedException e)
      {
        throw new JobExecutionException(-1, e);
      }

      return mediaUploadJob.getCachedResult();
    }
    else
    {
      throw je;
    }
  }

  public void putResult(Object result)
  {
    if (result instanceof IDocumentEntry)
    {
      try
      {
        writeString2File(new File(cuc.getWorkingDir(), RESULT + ENTRY_RESULT_SUFFIX), DocumentEntryHelper.toJSON((IDocumentEntry) result)
            .toString());
      }
      catch (IOException e)
      {
        new File(cuc.getWorkingDir(), RESULT + ENTRY_RESULT_SUFFIX).delete();
        putError(e);
      }
    }
  }

  protected void putError(Throwable e)
  {
    errorFile = new File(cuc.getWorkingDir(), Job.ERROR_RESULT);

    super.putError(e);
  }

  public File getResultFile()
  {
    return new File(cuc.getWorkingDir(), RESULT + ENTRY_RESULT_SUFFIX);
  }
}
