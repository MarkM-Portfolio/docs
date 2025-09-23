/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.impl;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.docs.common.util.HttpSettingsUtil;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.ThreadConfig;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionTaskManager;
import com.ibm.symphony.conversion.service.IFormatConverter;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.exception.TaskNotFoundException;

public class ConversionTaskManager implements IConversionTaskManager
{
  // singleton instance
  private static ConversionTaskManager instance = new ConversionTaskManager();

  // thread pool
  private ExecutorService threadPool;

  // id, task(Future) map
  private Map<String, Future<ConversionResult>> taskMap;

  // the number of threads to keep in the pool, even if they are idle.
  private int corePoolSize = 4;

  // the maximum number of threads to allow in the pool
  private int maximumPoolSize = 100;

  /**
   * when the number of threads is greater than the core, this is the maximum time that excess idle threads will wait for new tasks before
   * terminating. Time unit is milliseconds.
   */
  private int keepAliveTime = 6000;

  // the maximum number of job queue
  private int queueCapacity = 30000;

  // the maximum file length, default is 10m
  private int maxFileSize = 10240;

  Logger log = Logger.getLogger(ConversionTaskManager.class.getName());

  public static ConversionTaskManager getInstance()
  {
    return instance;
  }

  private ConversionTaskManager()
  {
    init();
  }

  private void init()
  {
    ConversionConfig config = ConversionConfig.getInstance();
    maxFileSize = 1024 * Integer.valueOf(config.getConfig("maxFileSize", maxFileSize).toString());

    corePoolSize = Integer.valueOf(config.getConfig("corePoolSize", corePoolSize).toString());
    maximumPoolSize = Integer.valueOf(config.getConfig("maximumPoolSize", maximumPoolSize).toString());
    keepAliveTime = Integer.valueOf(config.getConfig("keepAliveTime", keepAliveTime).toString());
    queueCapacity = Integer.valueOf(config.getConfig("queueCapacity", queueCapacity).toString());
    if (queueCapacity <= 0)
    {
      queueCapacity = 1;
    }
    log.info("Creating thread pool with corePoolSize(" + corePoolSize + ") maximumPoolSize(" + maximumPoolSize + ") keepAliveTime("
        + keepAliveTime + ") queueCapacity(" + queueCapacity + ")");
    threadPool = new ThreadPoolExecutor(corePoolSize, maximumPoolSize, keepAliveTime, TimeUnit.MILLISECONDS, new ArrayBlockingQueue(
        queueCapacity), new ThreadPoolExecutor.DiscardPolicy());
    taskMap = new HashMap<String, Future<ConversionResult>>();

  }

  public String submitConversionTask(String sourceMIMEType, String targetMIMEType, File sourceFile, File targetFolder, Map parameters)
      throws ConversionException, RejectedExecutionException
  {
    log.entering(getClass().getName(), "addConversionTask", new Object[] { sourceMIMEType, targetMIMEType, sourceFile });
    if (sourceFile.length() > maxFileSize)
    {
      throw new ConversionException(ConversionConstants.ERROR_FILE_IS_TOO_LARGE);
    }
    if (ConversionService.getInstance().supports(sourceMIMEType, targetMIMEType))
    {
      Future<ConversionResult> future = threadPool.submit(new ConversionTask(sourceMIMEType, targetMIMEType, sourceFile, targetFolder,
          parameters));
      String id = UUID.randomUUID().toString();
      taskMap.put(id, future);
      log.exiting(getClass().getName(), "addConversionTask", id);
      return id;
    }
    log.exiting(getClass().getName(), "addConversionTask");
    return null;
  }

  public String submitConversionTask(String sourceMIMEType, String targetMIMEType, File sourceFile, Map parameters)
      throws ConversionException, RejectedExecutionException
  {
    return submitConversionTask(sourceMIMEType, targetMIMEType, sourceFile, null, parameters);
  }

  public boolean isCompleted(String jobId) throws ConversionException
  {
    log.entering(getClass().getName(), "isCompleted", jobId);
    if (!taskMap.containsKey(jobId))
    {
      throw new TaskNotFoundException();
    }
    Object obj = taskMap.get(jobId);
    if (obj != null)
    {
      Future task = (Future) obj;
      log.exiting(getClass().getName(), "isCompleted", task.isDone());
      return task.isDone();
    }
    log.exiting(getClass().getName(), "isCompleted", false);
    return false;
  }

  public boolean isCompleted(String jobId, String targetFolder) throws ConversionException
  {
    // TODO Auto-generated method stub
    return false;
  }

  public ConversionResult getConversionResult(String jobId) throws ConversionException
  {
    log.entering(getClass().getName(), "getConversionResult", jobId);
    if (!taskMap.containsKey(jobId))
    {
      throw new TaskNotFoundException();
    }
    if (isCompleted(jobId))
    {
      Future<ConversionResult> task = taskMap.get(jobId);
      if (task != null && task.isDone())
        try
        {
          ConversionResult result = task.get();
          // remove the entry, so that a result can be fetched only one time
          taskMap.remove(jobId);
          log.exiting(getClass().getName(), "getConversionResult", result);
          return result;
        }
        catch (InterruptedException e)
        {
          log.severe(new LogEntry(ThreadConfig.getRequestID(), String.format("InterruptedException %s ", new Object[] { e })).toString());
          e.printStackTrace();
        }
        catch (ExecutionException e)
        {
          log.severe(new LogEntry(ThreadConfig.getRequestID(), String.format("ExecutionException %s ", new Object[] { e })).toString());
          e.printStackTrace();
        }
    }
    log.exiting(getClass().getName(), "getConversionResult");
    return null;
  }

  public ConversionResult getConversionResult(String jobId, String targetFolder) throws ConversionException
  {
    // TODO Auto-generated method stub
    return null;
  }

  public void cancelConversionTask(String jobId) throws ConversionException
  {
    log.entering(getClass().getName(), "cancelConversionTask", jobId);
    Future task = taskMap.get(jobId);
    if( task != null)
    {
      task.cancel(true);
      //remove from taskMap, here can not make sure to remove task instance in taskMap for cluster env
      //because the task instance may be in other node memory.
      taskMap.remove(jobId);
      log.log(Level.INFO, "canceled the conversion job: " + jobId);
    }
    log.exiting(getClass().getName(), "cancelConversionTask", "void");
  }

  class ConversionTask implements Callable<ConversionResult>
  {
    private String sourceMIMEType;

    private String targetMIMEType;

    private File sourceFile;

    private File targetFolder;

    private Map parameters;

    /**
     * @param sourceMIMEType
     *          - the MIME type of the input file or folder, such as "text/html" or "application/vnd.oasis.opendocument.text"
     * @param targetMIMEType
     *          - the MIME type of the output file or folder, such as "text/html" or "application/vnd.oasis.opendocument.text"
     * @param sourceFile
     *          - the file to be converted
     * @param targetFolder
     *          - the target folder to store converted file
     * @param parameters
     *          - the parameters for converter
     */
    public ConversionTask(String sourceMIMEType, String targetMIMEType, File sourceFile, File targetFolder, Map parameters)
    {
      this.sourceMIMEType = sourceMIMEType;
      this.targetMIMEType = targetMIMEType;
      this.sourceFile = sourceFile;
      this.targetFolder = targetFolder;
      this.parameters = parameters;
    }

    public ConversionResult call() throws Exception
    {
      log.entering(getClass().getName(), "call", new Object[] { sourceMIMEType, targetMIMEType, sourceFile });

      ConversionService service = ConversionService.getInstance();
      IFormatConverter converter = service.getConverter(sourceMIMEType, targetMIMEType);
      ConversionResult result = null;
      try
      {
        if (targetFolder == null)
        {
          result = converter.convert(sourceFile, parameters);
        }
        else
        {
          result = converter.convert(sourceFile, targetFolder, parameters);
        }
        // set mimetype if not set. It maybe "application/zip" for "text/html".
        if (result.getMimeType() == null)
        {
          result.setMimeType(targetMIMEType);
        }
        log.exiting(getClass().getName(), "call", result);
        return result;
      }
      catch (Throwable e)
      {
        String requestid = (String) this.parameters.get(HttpSettingsUtil.REQUEST_ID);
        log.severe(new LogEntry(requestid, String.format("Throwable %s ", new Object[] { e })).toString());
        e.printStackTrace();
        if (result == null)
        {
          result = new ConversionResult();
        }
        ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, false, "", e.getMessage());
        result.addWarning(ce);
        result.setSucceed(false);
      }
      log.exiting(getClass().getName(), "call");
      return null;
    }
  }

}
