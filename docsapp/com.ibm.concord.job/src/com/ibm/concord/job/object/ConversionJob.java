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

import org.apache.commons.io.input.AutoCloseInputStream;

import com.ibm.concord.job.Job;
import com.ibm.concord.job.context.ConversionContext;
import com.ibm.concord.job.exception.JobExecutionException;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.conversion.ConversionComponentImpl;
import com.ibm.concord.platform.conversion.IConversionService;
import com.ibm.concord.platform.exceptions.ConversionException;
import com.ibm.concord.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.docs.common.io.ZipUtil;
import com.ibm.docs.framework.IComponent;

public class ConversionJob extends Job
{
  public static final int URI_MODE = 1;

  private ConversionContext cc;

  private IConversionService cs;

  public ConversionJob(ConversionContext cc)
  {
    super(cc);

    if (cc.mediaID == null)
    {
      throw new NullPointerException();
    }

    if (cc.mode != URI_MODE)
    {
      throw new IllegalArgumentException();
    }

    this.cc = cc;

    IComponent convComp = Platform.getComponent(ConversionComponentImpl.COMPONENT_ID);
    cs = (IConversionService) convComp.getService(IConversionService.class);
  }

  public Object exec() throws JobExecutionException
  {
    File resultFile1 = new File(cc.getWorkingDir(), RESULT + ZIP_RESULT_SUFFIX);
    if (resultFile1.exists())
    {
      return resultFile1;
    }

    File resultFile2 = new File(cc.getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX);
    if (resultFile2.exists())
    {
      return resultFile2;
    }

    Object result = null;
    try
    {
      result = cs.convert(cc.mediaURI, cc.sourceMime, cc.targetMime, cc.getWorkingDir().getPath(), cc.options);
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

    return result;
  }

  public void putResult(Object result)
  {
    if (result instanceof String)
    {
      try
      {
        if (new File((String) result).isDirectory())
        {
          ZipUtil.zip((String) result, new File(cc.getWorkingDir(), RESULT + ZIP_RESULT_SUFFIX).getPath());
        }
        else
        {
          writeMedia2File(new File(cc.getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX), new AutoCloseInputStream(new FileInputStream(
              (String) result)));
        }
      }
      catch (IOException e)
      {
        new File(cc.getWorkingDir(), RESULT + ZIP_RESULT_SUFFIX).delete();
        new File(cc.getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX).delete();
        putError(e);
      }
      catch (Exception e)
      {
        new File(cc.getWorkingDir(), RESULT + ZIP_RESULT_SUFFIX).delete();
        new File(cc.getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX).delete();
        putError(e);
      }
    }
  }

  public File getResultFile()
  {
    File resultFile1 = new File(cc.getWorkingDir(), RESULT + ZIP_RESULT_SUFFIX);
    File resultFile2 = new File(cc.getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX);
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
}
