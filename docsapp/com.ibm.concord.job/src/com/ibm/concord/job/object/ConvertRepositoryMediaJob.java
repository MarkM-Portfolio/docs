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
import com.ibm.concord.job.context.ConvertRepositoryMediaContext;
import com.ibm.concord.job.exception.JobExecutionException;
import com.ibm.concord.job.listener.ConvertRepositoryMediaJobListener;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.exceptions.ConversionException;
import com.ibm.concord.platform.exceptions.OutOfCapacityException;
import com.ibm.concord.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.document.services.IDocumentServiceProvider;
import com.ibm.json.java.JSONObject;

public class ConvertRepositoryMediaJob extends Job
{
  private static final Logger LOGGER = Logger.getLogger(ConvertRepositoryMediaJob.class.getName());

  private ConvertRepositoryMediaContext crmc;

  public ConvertRepositoryMediaJob(ConvertRepositoryMediaContext crmc)
  {
    super(crmc);

    /**
     * Listener is called after Job done, current do tasks below 1. Update Journal results 2. (TODO if add new tasks after job)
     * */
    ConvertRepositoryMediaJobListener exportMediaJobListener = new ConvertRepositoryMediaJobListener();
    this.addListener(exportMediaJobListener);

    if (crmc.mediaURI == null)
    {
      throw new NullPointerException();
    }

    this.crmc = crmc;
  }

  public Object exec() throws JobExecutionException
  {
    LOGGER.entering(ConvertRepositoryMediaJob.class.getName(), "exec");

    File resultFile1 = new File(crmc.getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX);
    if (resultFile1.exists())
    {
      return resultFile1;
    }

    File resultFile2 = new File(crmc.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX);
    if (resultFile2.exists())
    {
      return resultFile2;
    }

    IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent("com.ibm.concord.document.services")
        .getService(IDocumentServiceProvider.class);
    IDocumentService docService = docServiceProvider.getDocumentService(crmc.docEntry.getMimeType());

    try
    {
      result = docService.export(crmc.requester, crmc.docEntry, crmc.targetExtension, crmc.getWorkingDir().getPath(), crmc.options, null);
    }
    catch (ConversionException e)
    {
      JobExecutionException jee = new JobExecutionException(e.getErrCode(), e);
      JSONObject data = e.getData();
      if (!data.isEmpty())
      {
        Object formatData = data.get("correctFormat");
        if ((formatData != null) && (formatData.equals(crmc.targetExtension)))
        {
          jee = new JobExecutionException(ConversionException.EC_CONV_NO_NEED_TO_CONVERT, e);
        }
        else
        {
          jee.setData(data);
        }
      }

      jee.getData().put("jobid", e.getData().get("jobid"));
      throw jee;
    }
    catch (OutOfCapacityException e)
    {
      JobExecutionException jee = new JobExecutionException(e.getErrorCode(), e);
      JSONObject data = e.getData();
      if (data != null)
      {
        jee.setData(data);
      }
      throw jee;
    }
    catch (UnsupportedMimeTypeException e)
    {
      throw new JobExecutionException(e.getErrorCode(), e);
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
    File resultFile1 = new File(crmc.getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX);
    File resultFile2 = new File(crmc.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX);
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
          // create an empty result.none file as a flag to indicate the job has completed
          File resultFile = new File(crmc.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX);
          resultFile.createNewFile();
        }
        else
        {
          writeMedia2File(new File(crmc.getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX), new AutoCloseInputStream(new FileInputStream(
              (String) result)));
        }
      }
      catch (IOException e)
      {
        new File(crmc.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX).delete();
        new File(crmc.getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX).delete();
        putError(e);
      }
      catch (Exception e)
      {
        new File(crmc.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX).delete();
        new File(crmc.getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX).delete();
        putError(e);
      }
    }
  }
}
