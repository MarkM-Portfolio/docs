package com.ibm.concord.viewer.job.object;

import java.io.File;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.job.Job;
import com.ibm.concord.viewer.job.context.QuerySnapshotStatusContext;
import com.ibm.concord.viewer.job.exception.JobExecutionException;
import com.ibm.concord.viewer.platform.ConversionUtils;
import com.ibm.concord.viewer.platform.conversion.ConversionErrorCodeUtil;
import com.ibm.concord.viewer.platform.exceptions.ConversionException;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.Constant;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.json.java.JSONObject;

public class QuerySnapshotStatusJob extends Job
{
  private static final String STATUS_CODE = "statusCode"; //$NON-NLS-1$

  QuerySnapshotStatusContext context;

  private static final Logger logger = Logger.getLogger(QuerySnapshotStatusJob.class.getName());

  public QuerySnapshotStatusJob(QuerySnapshotStatusContext jobContext)
  {
    super(jobContext);
    currentType = Constant.STATUS_VIEW;

    context = (QuerySnapshotStatusContext) jobContext;
  }

  public String getDocumentId()
  {
    return context.snapshotDescriptor.getDocId();
  }

  public boolean hasUploadConversion()
  {
    return false;
  }

  @Override
  public void cleanFailure()
  {
    File[] files = context.getWorkingDir().listFiles();
    for (File file : files)
    {
      if (!file.getName().equals(context.getJobId()))
      {
        file.delete();
      }
    }
  }

  @Override
  public Object exec() throws JobExecutionException
  {
    StringBuffer msg = new StringBuffer("Snapshot generation failed. ");
    try
    {
      queryState();
    }
    catch (ConversionException e)
    {
      msg.append(ServiceCode.S_ERROR_CONVERSION_EXCEPTION);
      msg.append(" Error code:" + e.getErrCode());
      msg.append(" Error message:" + e.getMessage());
      msg.append(" Document id:" + context.docEntry.getDocId());
      msg.append(" Document mimetype:" + context.docEntry.getMimeType());
      msg.append(" Document version:" + context.docEntry.getVersion());
      logger.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.ERROR_CONVERSION_EXCEPTION, msg.toString()));
      JobExecutionException jee = new JobExecutionException(e.getErrCode(), e);
      JSONObject data = e.getData();
      if (data != null)
        jee.setData(data);
      throw jee;
    }
    catch (RepositoryAccessException e)
    {
      msg.append(ServiceCode.S_ERROR_ACCESS_REPOSITORY);
      msg.append(" Error code:" + e.getErrorCode());
      msg.append(" Error message:" + e.getMessage());
      msg.append(" Document id:" + context.docEntry.getDocId());
      msg.append(" Document mimetype:" + context.docEntry.getMimeType());
      msg.append(" Document version:" + context.docEntry.getVersion());
      logger.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.ERROR_ACESS_REPOSITORY, msg.toString()));
      JobExecutionException jee = new JobExecutionException(Integer.valueOf(e.getErrorCode()), e);
      throw jee;
    }
    catch (Exception e)
    {
      msg.append(ServiceCode.S_SEVERE_UNKNOWN_ERROR);
      msg.append(" Document id:" + context.docEntry.getDocId());
      msg.append(" Document mimetype:" + context.docEntry.getMimeType());
      msg.append(" Document version:" + context.docEntry.getVersion());
      logger.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.SEVERE_UNKNOWN_ERROR, msg.toString()), e);
      throw new JobExecutionException(-1, e);
    }
    return null;
  }

  private void queryState() throws ConversionException, RepositoryAccessException
  {
    boolean cont = true;
    String resultPath = context.snapshotDescriptor.getInternalURI();

    logger.info("Start to query result file: " + resultPath);

    int statusCode = 202;
    while (cont || (statusCode == 202))
    {
      if (shouldCancel())
      {
        throw new ConversionException("It takes too long time to convert the document from conversion server.",
            ConversionException.EC_CONV_CONVERT_TIMEOUT);
      }
      JSONObject json = null;
      if (context.snapshotDescriptor.accessible())
      {
        json = ConversionUtils.getConversionResult(resultPath);
        statusCode = (Integer) json.get(STATUS_CODE);
      }
      else
      {
        statusCode = 202;
      }

      if (statusCode == 200)
      {
        cont = false;
      }
      else if (statusCode == 202)
      {
        try
        {
          Thread.sleep(1000);
        }
        catch (InterruptedException e)
        {
          logger.warning("Query thread interrupted");
        }
      }
      else if (statusCode == 404 || statusCode == 500 || statusCode == 503 || statusCode == 504 || statusCode == 494)
      {
        // Not sure if we still need to keep this for snapshot
        // DON'T DO anything at the time
      }
      else if (statusCode == 413)
      {
        ConversionException ce = new ConversionException("File is too large to process", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$
        Object conv_err_code = json.get("conv_err_code");
        if (conv_err_code != null)
        {
          ce.getData().put(Constant.CONV_ERR_CODE, conv_err_code);
        }

        throw ce; 
      }
      else if (statusCode == 415)
      {
        ConversionException e = new ConversionException("Invalid document type", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$
        String format = (String) json.get("asFormat");
        e.setData(Constant.CORRECT_FORMAT, format);
        logger.warning("Invalid document type. Status code is " + statusCode);
        throw e;
      }
      else if (statusCode == 500)
      {
        throw new ConversionException("Invalid document format", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$
      }
      else if (statusCode == 491)
      {
        IDocumentEntry entry = context.docEntry;
        entry.setPwdProtected(true);
        RepositoryServiceUtil.putEntryToCache(context.requester, entry, entry.getDocUri());
        
        throw new ConversionException("Invalid password", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$
      }
      else if (statusCode == 492)
      {
        throw new ConversionException("File is password protected", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$        
      }
      else if (statusCode == 501)
      {
        throw new ConversionException("Unable to make the call to conversion server");
      }
      else if (statusCode == 521)
      {
        throw new ConversionException(
            "It takes too long time to convert the document from conversion server.", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$
      }
      else if (statusCode == 493)
      {
        logger.log(Level.WARNING, "Retried max time to convert , viewer in querystate but it still get: " + statusCode
            + " so it still failed. Document Id:" + getDocumentId());
        throw new ConversionException("System is currently busy.", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$
      }
      else if (statusCode == 522)
      {
        throw new ConversionException("Conversion server IO exception.", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$
      }
      else if (statusCode == 523)
      {
        throw new ConversionException("Single page conversion times out", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$
      }
      else if (statusCode == 524)
      {
        throw new ConversionException("Downsize exception occurred", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$
      }
      else if (statusCode == 528)
      {
        throw new ConversionException("Empty file exception occurred", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$
      }
      else if (statusCode == 529)
      {
        throw new ConversionException("Corrupted file exception occurred", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$
      }
      else if (statusCode == 496)
      {
        throw new ConversionException("Sym Connection is unavailable", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$
      }
      else if (statusCode == 1601 || statusCode == 1602)
      {
        throw new ConversionException("Cannot access to the storage server", statusCode); //$NON-NLS-1$
      }
      else if (statusCode == 1000 || statusCode == 1001 || statusCode == 1002 || statusCode == 1003 || statusCode == 1004
          || statusCode == 1005 || statusCode == 1007 || statusCode == 1013 || statusCode == 1014)
      {
        throw new RepositoryAccessException(String.valueOf(statusCode), "Can't access the document repository"); //$NON-NLS-1$
      }
      else
        throw new ConversionException("Server returned unexpected status.", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$
    }
  }

  // @Override
  public void putResult(Object result)
  {
    try
    {
      writeString2File(new File(context.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX), (String) result);
      logger.warning("Snapshot generataion done.  Document Id: " + context.docEntry.getDocId());
    }
    catch (IOException e)
    {
      new File(context.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX).delete();
      putError(e);
    }

  }

  //
  // @Override
  public File getResultFile()
  {
    return new File(context.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX);
  }

}
