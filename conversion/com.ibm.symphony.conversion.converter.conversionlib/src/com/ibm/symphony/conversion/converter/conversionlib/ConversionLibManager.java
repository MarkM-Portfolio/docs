package com.ibm.symphony.conversion.converter.conversionlib;

import java.io.File;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class ConversionLibManager
{
  private ConversionTaskQueue taskQue;

  private Integer clInstanceCount = 0;
  
  private Integer maxClInstancesCount = 0;
  
  private Integer maxQueueSize = 0;

  private long timeout = 0;
  
  private String convConfigFilePath;
  
  private boolean isConvLibEnabled = false;

  private volatile static ConversionLibManager instance;

  private static final Logger log = Logger.getLogger(ConversionLibManager.class.getName());

  public long getTimeout()
  {
    return timeout;
  }

  public long getMaxQueueSize()
  {
    return maxQueueSize;
  }
  
  public synchronized Integer getClInstanceCount()
  {
    return clInstanceCount;
  }

  public Integer getMaxClInstanceCount()
  {
    return maxClInstancesCount;
  }
  
  public boolean isConvLibEnabled()
  {
    return isConvLibEnabled;
  }

  private synchronized int addClInstance()
  {
    int ret = ++clInstanceCount;
    return ret;
  }

  private synchronized int getClInstance()
  {
    int ret = --clInstanceCount;
    if (ret >= 0)
    {
      return ret;
    }
    else
    {
      return -1;
    }
  }

  public static ConversionLibManager getInstance()
  {
    if (instance == null)
    {
      synchronized (ConversionLibManager.class)
      {
        if (instance == null)
        {
          instance = new ConversionLibManager();
        }
      }
    }
    return instance;
  }

  private ConversionLibManager()
  {
    taskQue = new ConversionTaskQueue();
    convConfigFilePath = ConversionService.getInstance().getConfigPath() + "conversion-config.json";
    JSONObject cl = (JSONObject) ConversionService.getInstance().getConfig("conversionLib");
    if(cl != null)
    {
      timeout = (Long)cl.get("timeout");
      isConvLibEnabled = (Boolean)cl.get("enabled");
      clInstanceCount = ((Long)cl.get("maxInstanceNum")).intValue();
      /**
       * maxInstanceNum set by sym_count * 2
       */
      clInstanceCount = clInstanceCount * 2;
      maxClInstancesCount = clInstanceCount;
      maxQueueSize = clInstanceCount * 4;
      log.log(Level.INFO, "Creating ConversionLibManager with maxInstanceNum(" + clInstanceCount + "), timeout(" + timeout + ")" +", ConversionLib is enabled: " + isConvLibEnabled);
    }
    else
    {
      log.log(Level.WARNING, "Missing ConversionLib configurations!");
    }
  }

  public ConversionResult convert(File sourceFile, File targetFile, String sourceType, String targetType, Map parameters)
  {
    ConversionTask task = new ConversionTask(sourceFile, targetFile, sourceType, targetType, parameters);
    ConversionResult result = new ConversionResult();
    if (getClInstance() == -1)
    {
      if (taskQue.size() >= getMaxQueueSize())
      {
        addClInstance();
        log.log(Level.SEVERE, "CLJOB is rejected and the sourcefile is "+sourceFile + ",as ConversionLibTaskQueue(size: " + getMaxQueueSize() + ") is full.");
        ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_OUT_OF_QUEUE_SIZE, false, "", "ConversionLibTaskQueue is full");
        result.addWarning(ce);
        result.setSucceed(false);
        return result;
      }
      taskQue.add(task);
      log.log(Level.INFO, "CLJOB was put into queue and the sourcefile is " + sourceFile + ",and now there are " + taskQue.size() + " tasks in queue.");
      synchronized (task)
      {
        try
        {
          task.wait();
        }
        catch (InterruptedException e)
        {
          addClInstance();
          ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, false, "", "InterruptedException,job is cancled");
          result.addWarning(ce);
          result.setSucceed(false);
          taskQue.remove(task);
          log.log(Level.SEVERE, "CLJOB was canceled and removed from queue and the sourcefile is " + sourceFile + ",as InterruptedException was catched.");
          return result;
        }
      }
    }
    try
    {
      result = ConversionLibConverter.convert(task.sourceFile, task.targetFile, task.sourceType, task.targetType, timeout, convConfigFilePath, task.options);
    }
    catch (Exception e)
    {
      log.log(Level.SEVERE, "CLJOB failed with UnknowError and the sourcefile is "+ sourceFile);
      ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, false, "", "UnknownError.");
      result.addWarning(ce);
      result.setSucceed(false);
      return result;
    }
    finally
    {
      notifyNext();
    }
    return result;
  }
  
  private void notifyNext()
  {
    addClInstance();
    ConversionTask nextTask = taskQue.get();
    if (nextTask != null)
    {
      log.log(Level.INFO,
          "CLJOB was taken from queue.the source file is " + nextTask.sourceFile + " ,and there are still " + taskQue.size()
              + " tasks in queue.");
      synchronized (nextTask)
      {
        nextTask.notifyAll();
      }
    }
  }
}
