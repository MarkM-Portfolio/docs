/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.conversion;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.httpclient.HttpClient;

import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.platform.conversion.ConversionTask.ConversionEvent;
import com.ibm.concord.viewer.platform.conversion.ConversionTask.TaskCategory;
import com.ibm.concord.viewer.platform.exceptions.ConversionException;
import com.ibm.concord.viewer.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.viewer.platform.util.Constant;
import com.ibm.concord.viewer.platform.util.DocumentTypeUtils;
import com.ibm.concord.viewer.platform.util.HttpClientCreator;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.spi.job.IConversionJob;
import com.ibm.concord.viewer.spi.job.IConversionJob.JOB_PRIORITY_TYPE;
import com.ibm.connections.httpClient.ServerToServerHttpClient;
import com.ibm.connections.httpClient.ServerToServerHttpClientFactory;
import com.ibm.docs.common.util.HttpSettingsUtil;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONObject;

public class RemoteConversionService implements IConversionService
{

  private static final Logger LOG = Logger.getLogger(ConversionService.class.getName());

  private static final String JOB_ID = "JOBID"; //$NON-NLS-1$

  private static final String STATUS_CODE = "statusCode"; //$NON-NLS-1$

  private static final String SERVICE_URL = "serviceurl"; //$NON-NLS-1$

  private static final String RESULT_URL = "resulturl"; //$NON-NLS-1$

  private static final String INTERVAL_OF_RETRY = "intervalofretry"; //$NON-NLS-1$

  private static final String MAX_TOTAL = "maxTotal"; //$NON-NLS-1$

  private static final String MAX_PER_ROUTE = "maxPerRoute"; //$NON-NLS-1$

  private static final String SOCKET_TIMEOUT = "socketTimeout";

  private static final String CONNECTION_TIMEOUT = "connectionTimeout";

  private static final String CONN_MANAGER_TIMEOUT = "connManagerTimeout";

  private static final int MULTIPLE_OF_INTERVAL = 2;

  private static final int MAX_REPEAT = 3;

  private static final int MAX_FULL_REPEAT = 3;

  private static String conversionServiceURL;

  private static String conversionResultURL;

  private static int timeInterval;

  private HttpClient httpClient;

  /**
   * time out for reading data from conversion server. TIME UNIT is millisecond.
   */
  private int socketTimeOut = 10000;

  /**
   * time out for establishing connection with conversion server. TIME UNIT is millisecond.
   */
  private int connectionTimeOut = 10000;

  /**
   * time out for get connection from connection pool of connection manager. TIME UNIT is millisecond.
   */
  private int connManagerTimeOut = 10000;

  public static String getConversionServiceURL()
  {
    return conversionServiceURL;
  }

  public static String getConversionResultURL()
  {
    return conversionResultURL;
  }

  public RemoteConversionService(JSONObject config)
  {
    if (config != null)
    {
      conversionServiceURL = (String) config.get(SERVICE_URL);
      conversionResultURL = (String) config.get(RESULT_URL);
      String interval = (String) config.get(INTERVAL_OF_RETRY);
      String j2cAlias = (String) config.get("j2c_alias");
      if (j2cAlias == null)
      {
        j2cAlias = (String) config.get("j2cAlias");
      }

      timeInterval = (interval != null) ? Integer.valueOf(interval) : 1000;

      String maxPerRoute = (String) config.get(MAX_PER_ROUTE);
      String total = (String) config.get(MAX_TOTAL);
      String soTimeoutStr = (String) config.get(SOCKET_TIMEOUT);
      String connTimeoutStr = (String) config.get(CONNECTION_TIMEOUT);
      String connMgrTimeoutStr = (String) config.get(CONN_MANAGER_TIMEOUT);

      socketTimeOut = (soTimeoutStr != null) ? Integer.valueOf(soTimeoutStr) * 1000 : socketTimeOut;
      connectionTimeOut = (connTimeoutStr != null) ? Integer.valueOf(connTimeoutStr) * 1000 : connectionTimeOut;
      connManagerTimeOut = (connMgrTimeoutStr != null) ? Integer.valueOf(connMgrTimeoutStr) * 1000 : connManagerTimeOut;

      int maxTotal = (total != null) ? Integer.valueOf(total) : 100;
      int defaultMaxPerRoute = (maxPerRoute != null) ? Integer.valueOf(maxPerRoute) : 100;
      LOG.info("HttpClient parameters: " + SOCKET_TIMEOUT + "=" + socketTimeOut + " " + CONNECTION_TIMEOUT + "=" + connectionTimeOut + " "
          + CONN_MANAGER_TIMEOUT + "=" + connManagerTimeOut + " " + MAX_TOTAL + "=" + maxTotal + " " + MAX_PER_ROUTE + "="
          + defaultMaxPerRoute);

      try
      {
        new URL(conversionServiceURL);
      }
      catch (MalformedURLException e)
      {
        LOG.log(Level.WARNING, "Invalid conversion URL: {0}", conversionServiceURL);
      }

      // initialize httpclient
      if (ViewerConfig.getInstance().isSmartCloud() || ViewerConfig.getInstance().isLocalEnv())
      {
        HttpClientCreator httpClientCreator = new HttpClientCreator();
        httpClientCreator.config(config);
        httpClient = httpClientCreator.create();
      }
      else
      {
        httpClient = ServerToServerHttpClientFactory.INSTANCE.getHttpClient(j2cAlias);
        ((ServerToServerHttpClient) httpClient).set_authHeaderChecking(false);
      }

    }

  }

  public ConversionTask convert(String path, String sourceType, String targetType) throws ConversionException,
      UnsupportedMimeTypeException, IOException
  {
    return convert(path, sourceType, targetType, getDefaultOutputPath(path), null, false, null);
  }

  public ConversionTask convert(String path, String sourceType, String targetType, String targetPath) throws ConversionException,
      UnsupportedMimeTypeException, IOException
  {
    return convert(path, sourceType, targetType, targetPath, null, false, null);
  }

  public ConversionTask convert(String path, String sourceType, String targetType, Map<String, Object> options) throws ConversionException,
      UnsupportedMimeTypeException, IOException
  {
    return convert(path, sourceType, targetType, getDefaultOutputPath(path), options, false, null);
  }

  public void handleTail(ArrayList<ConversionTask> taskList, IConversionJob job)
  {
    for (ConversionTask iTask : taskList)
    {
      if (iTask.getCategory().equals(TaskCategory.FULLIMAGES) || iTask.getCategory().equals(TaskCategory.HTML))
      {
        // Cancel pictures
        CancelTask cancel = new CancelTask(httpClient, iTask.getJobId(), conversionResultURL);
        try
        {
          cancel.exec();
          LOG.log(Level.INFO, "Cancel Task is called successfully for FullImage - Document Id:{0} JobId:{1} TaskId:{2}",
              new String[] { job.getDocumentId(), job.getJobId(), iTask.getJobId() });
        }
        catch (Exception e)
        {
          LOG.log(Level.WARNING, "Cancel action execution failed for FullImage - Document Id:{0} JobId:{1} TaskId:{2}",
              new String[] { job.getDocumentId(), job.getJobId(), iTask.getJobId() });
        }
      }
    }
  }

  public boolean queryState(ConversionTask[] tasks, IConversionJob job) throws ConversionException, IOException
  {
    int statusCode = 0;
    boolean tryAgain = true;
    JSONObject conversionResult = null;
    String thumbnailId = "Task ID:";
    int retryCount = 0;

    boolean needReset = false;
    ConversionTask thumbnailTask = null;
    ConversionTask picturesTask = null;
    for (int i = 0; i < tasks.length; i++)
    {
      thumbnailId = thumbnailId + tasks[i].getJobId() + " :";
      if (tasks[i].getCategory().equals(TaskCategory.FULLIMAGES))
      {
        if (tasks[i].getIsFolderChanged())
          needReset = true;
        picturesTask = tasks[i];
      }
      if (tasks[i].getCategory().equals(TaskCategory.THUMBNAILS))
      {
        thumbnailTask = tasks[i];
      }
    }
    if (needReset && thumbnailTask != null)
    {
      thumbnailTask.resetListener();
    }
    if (needReset && picturesTask != null)
    {
      picturesTask.resetListener();
    }

    LOG.log(Level.FINEST, "Conversion Query started for Tasks: " + thumbnailId);
    ArrayList<ConversionTask> taskList = new ArrayList<ConversionTask>(Arrays.asList(tasks));
    int checkFileCount = 0;
    while (taskList.size() > 0)
    {
      checkFileCount++;
      Iterator<ConversionTask> task_itr = taskList.iterator();
      while (task_itr.hasNext())
      {
    	ConversionTask task = task_itr.next();
        if (job != null)
        {
          if (job.shouldCancel())
          {
            handleTail(taskList, job);
            throw new ConversionException(
                "It takes too long time to convert the document from conversion server.", ConversionException.EC_CONV_CONVERT_TIMEOUT); //$NON-NLS-1$
          }
        }

        if (checkFileCount % MULTIPLE_OF_INTERVAL == 0)
        {
          try
          {
            conversionResult = task.getConversionResult(null, null);
            if (task.getCategory().equals(TaskCategory.THUMBNAILS) && taskList.size() > 1)
            {
              statusCode = 202;
            }
            else if (task.getCategory().equals(TaskCategory.THUMBNAILS) && taskList.size() == 1)
            {
              statusCode = 200;
            }
            else
            {
              statusCode = (Integer) conversionResult.get(STATUS_CODE);
            }

          }
          catch (Exception e)
          {
            throw new ConversionException("Conversion result could not be processed." + e.getMessage()); //$NON-NLS-1$
          }
        }
        else
        {
          statusCode = 202;
        }
        LOG.log(Level.FINEST, "Conversion Status Code: " + statusCode);

        // 404 Service not available in stand alone Env or conversion task unavailable
        // 500 internal error, critical error
        // 503 Authentication failure
        // 504 Heavy pressure
        // 494 server crash in cluster Env
        if (tryAgain && (statusCode == 404 || statusCode == 500 || statusCode == 503 || statusCode == 504 || statusCode == 494))
        {
          LOG.log(Level.INFO, "This enter repeate logic when getConversionResult is submitted, and the status code is:" + statusCode);
          retryCount = 0;
          tryAgain = false;
          try
          {
            Thread.sleep(timeInterval);
          }
          catch (InterruptedException e)
          {
            LOG.log(Level.WARNING, "The current thread is interrupted after 404/500/503/504/494 code is got");
            throw new ConversionException(
                "Thread.interrupted occurred after 404/500/503/504/494 code is got.", ConversionException.EC_CONV_UNEXPECIFIED_ERROR); //$NON-NLS-1$
          }
          try
          {
            conversionResult = task.repeatConvertRequest(true, false);
            if (task.getCategory().equals(TaskCategory.FULLIMAGES))
            {
              for (ConversionTask itask : taskList)
              {
                if (itask.getCategory().equals(TaskCategory.THUMBNAILS))
                {
                  // Here we just reset listener to use new target folder
                  itask.resetListener();
                  break;
                }
              }
            }
            statusCode = (Integer) conversionResult.get(STATUS_CODE);
          }
          catch (Exception e)
          {
            throw new ConversionException("Conversion request could not be processed when repeatConvertRequest is submitted. Document id:"
                + job.getDocumentId());
          }
        }
        if (statusCode == 493 && retryCount < MAX_REPEAT)
        {
          LOG.log(Level.WARNING, "Status code 493 is got in querystate for times :" + retryCount + " Document Id:" + job.getDocumentId());
          try
          {
            conversionResult = task.repeatConvertRequest(false, false);
            statusCode = (Integer) conversionResult.get(STATUS_CODE);
          }
          catch (Exception e)
          {
            throw new ConversionException(
                "Conversion request could not be processed when repeatConvertRequest is submitted for 493.Document id:"
                    + job.getDocumentId());
          }
          retryCount++;
        }
        if (statusCode == 200)
        {
          try
          {
            task.fireEvent(ConversionEvent.DONE);
            task.savePasswordHash();            
          }
          catch (FileNotFoundException e)
          {
            throw new ConversionException("FileNotFoundException throws on fireEvent(DONE). " + e.getMessage());
          }
          catch (InterruptedException e)
          {
            throw new ConversionException("InterruptedException throws on fireEvent(DONE). " + e.getMessage());
          }
          catch (IOException e)
          {
            throw new ConversionException("IOException throws on fireEvent(DONE). " + e.getMessage());
          }
          catch (Exception e)
          {
            throw new ConversionException("Exception throws on fireEvent(DONE). " + e.getMessage());
          }
          task_itr.remove();
          LOG.log(Level.FINE, "Task is removed:  " + task.getJobId());
        }
        else if (statusCode == 202)
        {
          try
          {
            task.fireEvent(ConversionEvent.CONVERTING);
          }
          catch (FileNotFoundException e)
          {
            throw new ConversionException("FileNotFoundException throws on fireEvent(CONVERTING). " + e.getMessage());
          }
          catch (InterruptedException e)
          {
            throw new ConversionException("InterruptedException throws on fireEvent(CONVERTING). " + e.getMessage());
          }
          catch (IOException e)
          {
            throw new ConversionException("IOException throws on fireEvent(CONVERTING). " + e.getMessage());
          }
          catch (Exception e)
          {
            throw new ConversionException("Exception throws on fireEvent(CONVERTING). " + e.getMessage());
          }

          LOG.log(Level.FINEST, Messages.getString("RemoteConversionService.11")); //$NON-NLS-1$
        }
        else if (statusCode == 413)
        {
          ConversionException ce = new ConversionException("File is too large to process", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$
          
          ce.getData().put(Constant.JOBID, conversionResult.get(JOB_ID));
          
          JSONObject limits = processConvertLimits(conversionResult);
          if (limits != null && !limits.isEmpty())
          {
            ce.getData().put(Constant.LIMITS, limits);
          }

          Object conv_err_code = conversionResult.get("conv_err_code");
          if (conv_err_code != null)
          {
            ce.getData().put(Constant.CONV_ERR_CODE, conv_err_code);
          }

          throw ce;
        }
        else if (statusCode == 415)  // HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE
        {
          ConversionException e = new ConversionException("Document MIME type does not match", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$
          String format = (String) conversionResult.get("asFormat");
          e.setData(Constant.CORRECT_FORMAT, format);
          LOG.warning("Document mime type does not match. Status code is " + statusCode);
          throw e;
        }
        else if (statusCode == 500) 
        {
          throw new ConversionException("Invalid document format", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$
        }
        else if (statusCode == 491)
        {
          ConversionException ce = new ConversionException("Invalid password", ConversionErrorCodeUtil.mapErrorCode(statusCode));
          ce.getData().put("jobid", conversionResult.get(JOB_ID));
          LOG.warning("Invalid password. The password protected file is: " + job.getDocumentId());
          throw ce;
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
          LOG.log(Level.WARNING, "Retried max time to convert , viewer in querystate but it still get: " + statusCode
              + " so it still failed. Document Id:" + job.getDocumentId());
          throw new ConversionException("System is currently busy.", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$
        }
        else if (statusCode == 520)
        { // ConversionErrorCodeUtil.SC_INVALID_FORMAT
          ConversionException e = new ConversionException("Invalid document type", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$
          LOG.warning("Invalid document type. Status code is " + statusCode);
          throw e;
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
        else
          throw new ConversionException("Server returned unexpected status.", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$
      }
      try
      {
        Thread.sleep(timeInterval);
      }
      catch (InterruptedException e)
      {
        LOG.log(Level.WARNING, "The thread is interrupted when sleeping in querystate method for next query.");
        throw new ConversionException(
            "The thread is interrupted when sleeping in querystate method for next query.", ConversionException.EC_CONV_UNEXPECIFIED_ERROR); //$NON-NLS-1$
      }
    }
    LOG.log(Level.FINEST, "Conversion Query finished for Tasks: " + thumbnailId);
    return true;
  }

  public ConversionTask convert(String path, String sourceType, String targetType, String targetPath, Map<String, Object> options,
      boolean async, IConversionJob job) throws ConversionException, UnsupportedMimeTypeException, IOException

  {
    TaskCategory category = ViewerUtil.getCategoryFromTargetPath(targetPath);

    ConversionTask task = null;
    if(Constant.STATUS_PASSWORD_PROMPT.equalsIgnoreCase(job.getCurrentType())) {
      task = new PasswordPromptConversionTask(conversionServiceURL, conversionResultURL, httpClient);
    }else if (category.equals(TaskCategory.FULLIMAGES))
      task = new FullImageConversionTask(conversionServiceURL, conversionResultURL, httpClient);
    else if (category.equals(TaskCategory.HTML))
      task = new JSONConversionTask(conversionServiceURL, conversionResultURL, httpClient);
    else if (category.equals(TaskCategory.THUMBNAILS))
      task = new ThumbnailConversionTask(conversionServiceURL, conversionResultURL, httpClient);
    else if (category.equals(TaskCategory.THUMBNAILSERVICE))
      task = new ThumbnailServiceConversionTask(conversionServiceURL, conversionResultURL, httpClient);

    if (job.getJobPriority() != null)
    {
      options.put(Constant.JOB_PRIORITY, job.getJobPriority());
    }
    else
    {
      options.put(Constant.JOB_PRIORITY, JOB_PRIORITY_TYPE.NORMAL);
    }
    
    // merge stellent options, moved to AbstractDocumentService
    // options.putAll(getStellentOptions(sourceType));
    showStellentConfiguration(options);

    JSONObject conversionResult = null;
    int retryCount = 0;
    String jobID = null;
    try
    {
      if(DocumentTypeUtils.XLSM_MIMETYPE.equals(sourceType))
        sourceType = DocumentTypeUtils.XLSM_MIMETYPE_2010;
      conversionResult = task.convertRequest(path, sourceType, targetType, targetPath, options, true, job.getCurrentType(), job.getPassword());

    }
    catch (Exception e)
    {
      throw new ConversionException("Conversion request could not be processed."); //$NON-NLS-1$
    }

    int statusCode = (Integer) conversionResult.get(STATUS_CODE);
    jobID = (String) conversionResult.get(JOB_ID);
    LOG.log(Level.INFO, "Conversion Request Returned: code=" + statusCode + ";source=" + path + "; target=" + targetPath);

    String responseID = (String) conversionResult.get(HttpSettingsUtil.RESPONSE_ID);
    LOG.info(new LogEntry(URLConfig.getRequestID(), responseID, String.format(" Conversion ConversionTask JobID %s . ", jobID)).toString());
    if (responseID != null && !"".equals(responseID))
    {
      URLConfig.setResponseID(responseID);
    }
    
    if (statusCode == 493)  // ERROR_OUT_OF_QUEUE_SIZE
    {
      while (retryCount < MAX_FULL_REPEAT)
      {
        LOG.log(Level.WARNING, "Status code 493 is got for times :" + retryCount + " Document Id:" + job.getDocumentId());
        try
        {
          Thread.sleep(timeInterval);
        }
        catch (InterruptedException e)
        {
          LOG.log(Level.WARNING, "The current thread is interrupted after 493 code is got for document Id:" + job.getDocumentId());
          throw new ConversionException(
              "Thread.interrupted occurred after 493 code is got.", ConversionException.EC_CONV_UNEXPECIFIED_ERROR); //$NON-NLS-1$
        }
        try
        {
          conversionResult = task.repeatConvertRequest(false, true);
          statusCode = (Integer) conversionResult.get(STATUS_CODE);
          if (statusCode != 493)
            break;
        }
        catch (Exception e)
        {
          LOG.log(Level.WARNING, e.getMessage());
          throw new ConversionException("Conversion request could not be processed during retry with detect = true. Times: " + retryCount); //$NON-NLS-1$
        }
        retryCount++;
      }
      if (retryCount >= MAX_REPEAT && statusCode == 493)
      {
        try
        {
          conversionResult = task.repeatConvertRequest(false, false);
          statusCode = (Integer) conversionResult.get(STATUS_CODE);
        }
        catch (Exception e)
        {
          throw new ConversionException("Conversion request could not be processed during retry with detect = false. Times: " + retryCount); //$NON-NLS-1$
        }
      }
    }

    // 404 Service not available in stand alone Env or conversion task unavailable
    // 500 internal error, critical error
    // 503 Authentication failure
    // 504 Heavy pressure
    // 494 server crash in cluster Env
    if (statusCode == 404 || statusCode == 500 || statusCode == 503 || statusCode == 504 || statusCode == 494)
    {
      LOG.log(Level.INFO, "This enter repeate logic when convertRequest is submitted, and the status code is:" + statusCode);
      try
      {
        Thread.sleep(timeInterval);
      }
      catch (InterruptedException e)
      {
        LOG.log(Level.WARNING, "The current thread is interrupted after 404/500/503/504/494 code is got");
        throw new ConversionException(
            "Thread.interrupted occurred after 404/500/503/504/494 code is got.", ConversionException.EC_CONV_UNEXPECIFIED_ERROR); //$NON-NLS-1$
      }
      try
      {
        conversionResult = task.repeatConvertRequest(true, false);
        statusCode = (Integer) conversionResult.get(STATUS_CODE);
        task.setIsFolderChanged(true);
      }
      catch (Exception e)
      {
        throw new ConversionException("Conversion request could not be processed when repeatConvertRequest is submitted.");
      }
    }

    if (statusCode == 202)
    {
      /* String jobID = (String) */conversionResult.get(JOB_ID);

      if (async)
      {
        return task;
      }

      queryState(new ConversionTask[] { task }, job);

    }
    else if (statusCode == 406)
    {
      throw new ConversionException("Unsupported document type.", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$
    }
    else if (statusCode == 413)
    {
      ConversionException ce = new ConversionException("File is too large to process", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$
      
      ce.getData().put(Constant.JOBID, conversionResult.get(JOB_ID));
      
      JSONObject limits = processConvertLimits(conversionResult);
      if (limits != null && !limits.isEmpty())
      {
        ce.getData().put(Constant.LIMITS, limits);
      }

      Object conv_err_code = conversionResult.get("conv_err_code");
      if (conv_err_code != null)
      {
        ce.getData().put(Constant.CONV_ERR_CODE, conv_err_code);
      }

      throw ce; 
    }
    else if (statusCode == 415)
    {
      ConversionException e = new ConversionException("Invalid document type", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$
      String format = (String) conversionResult.get("asFormat");
      e.setData(Constant.CORRECT_FORMAT, format);
      LOG.warning("Invalid document type. Status code is " + statusCode);
      throw e;
    }
    else if (statusCode == 411)
    {
      throw new ConversionException("Length Required", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$
    }
    else if (statusCode == 493)
    {
      LOG.log(Level.WARNING,
          "Retried max time to convert, viewer still get: " + statusCode + " so it still failed. Document Id:" + job.getDocumentId());
      throw new ConversionException("System is currently busy.", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$
    }
    else if (statusCode == 496)
    {
      throw new ConversionException("Sym Connection is unavailable", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$
    }
    else
      throw new ConversionException("Server returned unexpected status", ConversionErrorCodeUtil.mapErrorCode(statusCode)); //$NON-NLS-1$

    return task;
  }

  private String getDefaultOutputPath(String path)
  {
    File f = new File(path);
    if (!f.isDirectory())
    {
      File p;
      if (f != null && ((p = f.getParentFile()) != null))
        return p.getAbsolutePath();
      return null;
    }
    else
      return path;
  }

  private void showStellentConfiguration(Map<String, Object> options)
  {
    Iterator<String> itr = options.keySet().iterator();
    LOG.log(Level.FINER, "Current Stellent Options:");
    while (itr.hasNext())
    {
      String key = itr.next().toString();
      String value = options.get(key) == null ? null : options.get(key).toString();
      LOG.log(Level.FINER, key + ":" + value);
    }
  }

  // This is only used to create thumbnails ConversionTask
  public ConversionTask createConversionTask(TaskCategory category)
  {
    if (category.equals(TaskCategory.THUMBNAILS))
      return new ThumbnailConversionTask(conversionServiceURL, conversionResultURL, null);
    else if (category.equals(TaskCategory.HTML))
      return new JSONConversionTask(conversionServiceURL, conversionResultURL, null);
    else if (category.equals(TaskCategory.THUMBNAILSERVICE))
      return new ThumbnailServiceConversionTask(conversionServiceURL, conversionResultURL, null);
    else
      return new FullImageConversionTask(conversionServiceURL, conversionResultURL, null);
  }

  @Override
  public HttpClient getHttpClient()
  {
    return httpClient;
  }
  
  /**
   * Get the limitations of conversion server on documents.
   * 
   * @param result
   * @return
   */
  private JSONObject processConvertLimits(JSONObject result)
  {
    JSONObject limits = new JSONObject();
    if (result != null && result.get("config") instanceof JSONObject)
    {
      JSONObject config = (JSONObject) result.get("config");
      if (config.get("document") instanceof JSONObject)
      {
        limits.put("text", config.get("document"));
      }
      if (config.get("spreadSheet") instanceof JSONObject)
      {
        limits.put("sheet", config.get("spreadSheet"));
      }
      if (config.get("presentation") instanceof JSONObject)
      {
        limits.put("pres", config.get("presentation"));
      }
    }
    return limits;
  }  
}
