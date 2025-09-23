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
import java.io.IOException;
import java.util.logging.Logger;

import org.apache.commons.io.input.AutoCloseInputStream;

import com.ibm.concord.job.Job;
import com.ibm.concord.job.context.ConvertDraftMediaContext;
import com.ibm.concord.job.exception.JobExecutionException;
import com.ibm.concord.job.listener.ConvertDraftMediaJobListener;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.exceptions.ConversionException;
import com.ibm.concord.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.document.services.IDocumentServiceProvider;

public class ConvertDraftMediaJob extends Job
{
  private static final Logger LOGGER = Logger.getLogger(ConvertDraftMediaJob.class.getName());

  private ConvertDraftMediaContext cdmc;

  public ConvertDraftMediaJob(ConvertDraftMediaContext cdmc)
  {
    super(cdmc);

    /**
     * Listener is called after Job done, current do tasks below 1. Update Journal results 2. (TODO if add new tasks after job)
     * */
    ConvertDraftMediaJobListener exportMediaJobListener = new ConvertDraftMediaJobListener();
    this.addListener(exportMediaJobListener);

    if (cdmc.mediaURI == null)
    {
      throw new NullPointerException();
    }

    this.cdmc = cdmc;
  }

  public Object exec() throws JobExecutionException
  {
    LOGGER.entering(ConvertDraftMediaJob.class.getName(), "exec");

    File resultFile1 = new File(cdmc.getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX);
    if (resultFile1.exists())
    {
      return resultFile1;
    }

    File resultFile2 = new File(cdmc.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX);
    if (resultFile2.exists())
    {
      return resultFile2;
    }

    IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent("com.ibm.concord.document.services")
        .getService(IDocumentServiceProvider.class);
    IDocumentService docService = docServiceProvider.getDocumentService(cdmc.docEntry.getMimeType());

    try
    {
      result = docService.export(cdmc.requester, cdmc.docEntry, cdmc.targetExtension, cdmc.getWorkingDir().getPath(), cdmc.options,
          cdmc.draftDesp);
    }
    catch (ConversionException e)
    {
      JobExecutionException ne = new JobExecutionException(e.getErrCode(), e);
      ne.getData().put("jobid", e.getData().get("jobid"));
      throw ne;
    }
    catch (UnsupportedMimeTypeException e)
    {
      throw new JobExecutionException(-1, e);
    }
    catch (Exception e)
    {
      throw new JobExecutionException(-1, e);
    }

    LOGGER.exiting(ConvertRepositoryMediaJob.class.getName(), "exec", "SUCCESS");
    return result;

  }

  public File getResultFile()
  {
    File resultFile1 = new File(cdmc.getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX);
    File resultFile2 = new File(cdmc.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX);
    if (resultFile1.exists())
    {
      return resultFile1;
    }
    else if (resultFile2.exists())
    {
      return resultFile2;
    }
    else
    {
      throw new IllegalStateException();
    }
  }

  public void putResult(Object result)
  {
    if (result instanceof String)
    {
      try
      {
        if (new File((String) result).isDirectory())
        {
          // create an empty result.zip file as a flag to indicate the job has completed
          File resultFile = new File(cdmc.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX);
          resultFile.createNewFile();
        }
        else
        {
          writeMedia2File(new File(cdmc.getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX), new AutoCloseInputStream(new FileInputStream(
              (String) result)));
        }
      }
      catch (IOException e)
      {
        new File(cdmc.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX).delete();
        new File(cdmc.getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX).delete();
        putError(e);
      }
      catch (Exception e)
      {
        new File(cdmc.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX).delete();
        new File(cdmc.getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX).delete();
        putError(e);
      }
    }
  }
}
