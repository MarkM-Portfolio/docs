/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.conversion.service.rest.servlet;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.RejectedExecutionException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.naming.InitialContext;
import javax.naming.NamingException;

import com.ibm.conversion.service.rest.servlet.util.WASConfigHelper;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.ThreadConfig;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.IConversionTaskManager;
import com.ibm.symphony.conversion.service.common.ConversionLogger;
import com.ibm.symphony.conversion.service.common.ErrCodeConstants;
import com.ibm.symphony.conversion.service.common.util.FileUtil;
import com.ibm.symphony.conversion.service.common.util.NFSFileUtil;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.exception.TaskNotFoundException;
import com.ibm.websphere.asynchbeans.WorkException;
import com.ibm.websphere.asynchbeans.WorkManager;

public class ConversionWorkManager implements IConversionTaskManager
{
  private static final Logger LOG = Logger.getLogger(ConversionWorkManager.class.getName());

  private static final int LOG_ID = 1240;// 1240-1249

  private static final String WORKMANAGER = "java:comp/env/com/ibm/symphony/conversion/workmanager";

  private static WorkManager workManager = null;

  private IConversionService conversionService = null;

  private File tempFolder = null;

  private File serverMonitorFile = null;

  private static ConversionWorkManager instance = new ConversionWorkManager();

  private Map<String, ConversionWork> taskMap = null;

  private Map<String, ConversionWork> uploadConvertJobQueue = null;

  private int idleResourcePercent = 75;

  private int workManagerMaxThreads = 16;

  private int threadsCount = 0;

  private int workManagerMaxQSize = 8;

  private int workManagerTimeout = 120000;

  private ConversionWorkManager()
  {
    taskMap = new ConcurrentHashMap<String, ConversionWork>();
    uploadConvertJobQueue = new ConcurrentHashMap<String, ConversionWork>();
    initWorkManager();
  }

  private void initWorkManager()
  {
    try
    {
      InitialContext context = new InitialContext();
      workManager = (WorkManager) context.lookup(WORKMANAGER);
      workManagerMaxThreads = WASConfigHelper.getConvWorkManagerMaxThreads();
      workManagerMaxQSize = WASConfigHelper.getConvWorkManagerMaxQSize();
      workManagerTimeout = WASConfigHelper.getConvWorkManagerTimeout();
    }
    catch (NamingException e)
    {
      ConversionLogger.log(LOG, Level.INFO, LOG_ID, "Conversion Work Manager is not configured.");
      workManager = null;
    }
  }

  private boolean jobResultFileExists(String targetFolder)
  {
    String resultPath = targetFolder + File.separator + Constants.JOB_RESULT_FILE_NAME;
    return FileUtil.exists(new File(resultPath));
  }

  private ConversionResult readConversionResult(String targetFolder)
  {
    ConversionResult result = new ConversionResult();
    String content = null;
    try
    {
      String resultPath = targetFolder + File.separator + Constants.JOB_RESULT_FILE_NAME;
      content = NFSFileUtil.nfs_readFileAsString(new File(resultPath), NFSFileUtil.NFS_RETRY_SECONDS);
    }
    catch (IOException e)
    {
      result.setSucceed(false);
      ConversionLogger.log(
          LOG,
          Level.SEVERE,
          ErrCodeConstants.CONVERSION_RESULT_READ_ERR,
          new LogEntry(ThreadConfig.getRequestID(), String.format("Read conversion result %s , error - NFS Read IO exception %s .",
              new Object[] { serverMonitorFile.getAbsolutePath(), e })).toString());
      return result;
    }

    try
    {
      JSONObject convRes = JSONObject.parse(content);
      result.setSucceed((Boolean) convRes.get("isSuccess"));
      result.setMimeType((String) convRes.get("mimeType"));
      result.setConvertedFilePath((String) convRes.get("targetFilePath"));

      JSONArray errCodes = (JSONArray) convRes.get("errCodes");
      for (int i = 0; i < errCodes.size(); i++)
      {
        JSONObject warningObj = (JSONObject) errCodes.get(i);
        ConversionWarning convWarning = new ConversionWarning();
        convWarning.setFetureID((String) warningObj.get("id"));
        convWarning.setPreserved((Boolean) warningObj.get("isPreserved"));
        convWarning.setLocation((String) warningObj.get("location"));
        convWarning.setDescription((String) warningObj.get("description"));
        convWarning.setParameters((JSONObject) warningObj.get("parameters"));
        result.addWarning(convWarning);
      }
    }
    catch (IOException e)
    {
      ConversionLogger.log(
          LOG,
          Level.FINER,
          ErrCodeConstants.CONVERSION_RESULT_READ_ERR,
          new LogEntry(ThreadConfig.getRequestID(), String.format(
              "Read conversion result %s , error - parse JSON IO exception : %s . Try again.",
              new Object[] { serverMonitorFile.getAbsolutePath(), e })).toString());
      return null;
    }

    return result;
  }

  private void cleanOldResultFiles(File targetFolder, String id)
  {
    File resFile = new File(targetFolder, Constants.JOB_RESULT_FILE_NAME);
    if (FileUtil.exists(resFile))
    {
      if (!resFile.delete())
      {
        ConversionLogger.log(LOG, Level.WARNING, ErrCodeConstants.CONVERSION_RESULT_DEL_ERR, "Can not delete result.json file for job: "
            + id + ", pls caller make sure to delete it before submit conversion job, otherwise, may return unexpected conversion result.");
      }
    }

    // temp disable fail-over, so comment the below code now
    // File serverInfoFile = new File(targetFolder,ConversionWork.SERVER_INFO_FILE_NAME);
    // if(FileUtil.exists(serverInfoFile))
    // {
    // if(!serverInfoFile.delete())
    // {
    // ConversionLogger.log(LOG, Level.WARNING, ErrCodeConstants.CONVERSION_SERVERINFO_DEL_ERR,
    // "can not delete serverInfo.txt file for job: " + id +
    // ", pls caller make sure to delete it before submit conversion job, otherwise, may return unexpected conversion result.");
    // }
    // }

    File jobStatusFile = new File(targetFolder, Constants.JOB_STATUS_FILE_NAME);
    if (FileUtil.exists(jobStatusFile))
    {
      if (!jobStatusFile.delete())
      {
        ConversionLogger.log(LOG, Level.WARNING, ErrCodeConstants.CONVERSION_JOB_STATUS_DEL_ERR,
            "can not delete status.json file for job: " + id
                + ", pls caller make sure to delete it before submit conversion job, otherwise, may return unexpected conversion result.");
      }
    }
  }

  public static ConversionWorkManager getInstance()
  {
    return instance;
  }

  public static boolean supportWorkManager()
  {
    return (workManager != null);
  }

  @SuppressWarnings("rawtypes")
  public void setConversionService(IConversionService conversionService)
  {
    this.conversionService = conversionService;
    tempFolder = new File(conversionService.getRepositoryPath(), Constants.TEMP_FOLDER_NAME);
    if (!tempFolder.exists())
    {
      tempFolder.mkdirs();
    }
    Map uploadConvCfg = (Map) this.conversionService.getConfig("convertDuringUpload");
    if (uploadConvCfg != null)
    {
      Long tempLng = (Long) uploadConvCfg.get("idleResourcePercent");
      if (tempLng != null)
        idleResourcePercent = tempLng.intValue();
    }
  }

  public File getServerMonitorFile()
  {
    return serverMonitorFile;
  }

  public File getConversionTempFolder()
  {
    return tempFolder;
  }

  public Map<String, ConversionWork> getTaskMap()
  {
    return taskMap;
  }

  public Map<String, ConversionWork> getUploadConvertJobQueue()
  {
    return uploadConvertJobQueue;
  }

  public int getIdleResourcePercent()
  {
    return idleResourcePercent;
  }

  public int getWorkManagerMaxThreads()
  {
    return workManagerMaxThreads;
  }

  public int getWorkManagerMaxQSize()
  {
    return workManagerMaxQSize;
  }

  public int getWorkManagerTimeout()
  {
    return workManagerTimeout;
  }

  public void startWork(String jobId, ConversionWork work)
  {
    try
    {
      this.updateThreadCount(true);
      this.taskMap.put(jobId, work);
      LOG.log(Level.INFO, "Start convert work with jobId {0} and current thread number is {1} and task number remained is {2}",
          new Object[] { jobId, ConversionWorkManager.getInstance().getThreadCount(),
              ConversionWorkManager.getInstance().getTaskMap().size() });
      workManager.startWork(work);
    }
    catch (WorkException e)
    {
      ConversionLogger.log(LOG, Level.SEVERE, ErrCodeConstants.CONVERSION_WAS_WORK_ERR,
          new LogEntry(ThreadConfig.getRequestID(), String.format("WAS Conversion Work exception %s ", new Object[] { e })).toString());
    }
    catch (IllegalArgumentException e)
    {
      ConversionLogger.log(
          LOG,
          Level.SEVERE,
          ErrCodeConstants.CONVERSION_WAS_WORK_ERR,
          new LogEntry(ThreadConfig.getRequestID(), String
              .format("WAS Conversion Work illegal parameter exception %s ", new Object[] { e })).toString());
    }
  }

  public synchronized void updateThreadCount(boolean isIncrease)
  {
    if (isIncrease)
      threadsCount++;
    else
      threadsCount--;
  }

  public synchronized int getThreadCount()
  {
    return threadsCount;
  }

  @SuppressWarnings("rawtypes")
  public String submitConversionTask(String sourceMIMEType, String targetMIMEType, File sourceFile, Map parameters)
      throws ConversionException, RejectedExecutionException
  {
    return submitConversionTask(sourceMIMEType, targetMIMEType, sourceFile, null, parameters);
  }

  @SuppressWarnings("rawtypes")
  public String submitConversionTask(String sourceMIMEType, String targetMIMEType, File sourceFile, File targetFolder, Map parameters)
      throws ConversionException, RejectedExecutionException
  {
    LOG.entering(getClass().getName(), "addConversionTask", new Object[] { sourceMIMEType, targetMIMEType, sourceFile });

    if (conversionService.supports(sourceMIMEType, targetMIMEType))
    {
      String id = UUID.randomUUID().toString();
      cleanOldResultFiles(targetFolder, id);
      ConversionWork conversionWork = new ConversionWork(id, sourceMIMEType, targetMIMEType, sourceFile, targetFolder, conversionService,
          parameters);

      if (Boolean.valueOf((String) parameters.get(Constants.PARAMETER_UPLOAD_CONVERT)))
      {
        LOG.log(Level.INFO, "put upload Convert into uploadConvertJobQueue with job Id: " + id + "  " + sourceFile);
        uploadConvertJobQueue.put(id, conversionWork);
      }
      else
      {
        this.startWork(id, conversionWork);
      }

      LOG.exiting(getClass().getName(), "addConversionTask", new Object[] { sourceMIMEType, targetMIMEType, sourceFile });
      return id;
    }
    LOG.exiting(getClass().getName(), "addConversionTask", new Object[] { sourceMIMEType, targetMIMEType, sourceFile });
    return null;
  }

  public ConversionResult getConversionResult(String jobId) throws ConversionException
  {
    // TODO Auto-generated method stub
    ConversionLogger.log(LOG, Level.INFO, LOG_ID + 3,
        "Wrong REST API Call, should pass two parameters both job id and target folder, maybe Conversion Work Manager is not configured.");
    return null;
  }

  public ConversionResult getConversionResult(String jobId, String targetFolder) throws ConversionException
  {
    LOG.entering(getClass().getName(), "getConversionResult", new Object[] { jobId, targetFolder });
    ConversionResult result = null;
    if (taskMap.containsKey(jobId))
    {
      ConversionWork work = taskMap.get(jobId);
      result = work.get();
      // remove the entry, so that a result can be fetched only one time
      taskMap.remove(jobId);
    }
    else
    {
      result = readConversionResult(targetFolder);
    }
    LOG.exiting(getClass().getName(), "getConversionResult", new Object[] { jobId, targetFolder });
    return result;
  }

  public boolean isCompleted(String jobId) throws ConversionException
  {
    // TODO Auto-generated method stub
    return false;
  }

  public boolean isCompleted(String jobId, String targetFolder) throws ConversionException
  {
    LOG.entering(getClass().getName(), "isCompleted", new Object[] { jobId, targetFolder });
    boolean isComplete = false;
    // temp disable fail-over, so not start the server monitor initialization
    // if (serverMonitorFile == null)
    // {
    // initializeServerMonitor();
    // }

    if (taskMap.containsKey(jobId))
    {
      ConversionWork work = taskMap.get(jobId);
      isComplete = work.isDone();
    }
    else
    {
      if (targetFolder == null || targetFolder.isEmpty())
      {
        ConversionLogger.log(LOG, Level.WARNING, ErrCodeConstants.CONVERSION_TASK_MISSING_ERR, new LogEntry(ThreadConfig.getRequestID(),
            "Target folder is null, conversion task not found.").toString());
        throw new TaskNotFoundException();
      }
      if (jobResultFileExists(targetFolder))
      {
        isComplete = true;
      }
      else
      // the job is not complete
      {
        isComplete = false;
      }
    }

    LOG.exiting(getClass().getName(), "isCompleted", new Object[] { jobId, targetFolder });
    return isComplete;
  }

  public void cancelConversionTask(String jobId) throws ConversionException
  {
    LOG.entering(getClass().getName(), "cancelConversionTask", jobId);
    ConversionWork work = taskMap.get(jobId);
    if (work != null)
    {
      work.cancel();
      // remove the job from task map
      taskMap.remove(jobId);
      // here can not cancel the task running on other node for cluster env
      ConversionLogger.log(LOG, Level.INFO, LOG_ID + 4, "canceled the conversion job: " + jobId + " source: "
          + work.getSourceFile().getAbsolutePath());
    }
    else
    {
      ConversionLogger.log(LOG, Level.INFO, LOG_ID + 4, "Todo: cancel the conversion job: " + jobId);
    }

    LOG.exiting(getClass().getName(), "cancelConversionTask", jobId);
  }
}
