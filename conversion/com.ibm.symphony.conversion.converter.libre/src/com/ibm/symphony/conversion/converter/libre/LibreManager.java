/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of HCL                              */
/*                                                                   */
/* Copyright HCL Technologies Ltd. 2021                       		 */
/*                                                                   */
/* US Government Users Restricted Rights                             */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.libre;

import java.io.File;
import java.io.InputStream;
import java.util.Map;
import java.util.Properties;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class LibreManager
{
  private ConversionTaskQueue taskQue;

  private Integer libreInstanceCount;
  
  private Integer maxStInstancesCount;

  private volatile static LibreManager instance;

  public static Properties config;

  private long maxQueueSize;

  private long timeout;

  private static final Logger log = Logger.getLogger(LibreManager.class.getName());

  public long getTimeout()
  {
    return timeout;
  }

  public static Properties getConfig()
  {
    return config;
  }

  public long getMaxQueueSize()
  {
    return maxQueueSize;
  }
  
  public synchronized Integer getStInstanceCount()
  {
    return libreInstanceCount;
  }
  
  public synchronized Integer getStFreeQueueSize() {
    return Integer.valueOf((int)maxQueueSize - taskQue.size());
  }

  public Integer getMaxStInstanceCount()
  {
    return maxStInstancesCount;
  }
  
  public synchronized int addLibre()
  {
    int ret = ++libreInstanceCount;
    return ret;
  }

  public synchronized int getLibre()
  {
    int ret = --libreInstanceCount;
    if (ret >= 0)
    {
      return ret;
    }
    else
    {
      return -1;
    }
  }

  public static LibreManager getInstance()
  {
    if (instance == null)
    {
      synchronized (LibreManager.class)
      {
        if (instance == null)
        {
          instance = new LibreManager();
        }
      }
    }
    return instance;
  }

  private LibreManager()
  {
 
    JSONObject libreExport = (JSONObject) ConversionService.getInstance().getConfig("libreOffice"); 
    maxQueueSize = Integer.valueOf(libreExport.get("queueCapacity").toString());
    timeout = Long.valueOf(libreExport.get("timeout").toString());
    taskQue = new ConversionTaskQueue();
    libreInstanceCount = Integer.valueOf(libreExport.get("poolSize").toString());
    maxStInstancesCount = libreInstanceCount;
    log.log(Level.INFO, "Creating LibreManager with corePoolSize(" + libreInstanceCount + ") timeout(" + timeout + ") queueCapacity("
        + maxQueueSize + ")");
    config = new Properties();
    InputStream in = getClass().getResourceAsStream(Constants.CONFIG_FILE);
    Util.getConfig(config, in);
  }

  public ConversionResult convert(File sourceFile, Map parameters)
  {
    IConversionService conversionService = ConversionService.getInstance();
    File targetFolder = new File(conversionService.getRepositoryPath() + File.separator + "libre" + File.separator + "viewer"
        + File.separator + UUID.randomUUID());
    targetFolder.mkdirs();
    return convert(sourceFile, targetFolder, parameters);
  }

  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters)
  {
    ConversionTask task = new ConversionTask(sourceFile, targetFolder, parameters);
    ConversionResult result = new ConversionResult();
    int numOfST = getLibre();
    log.log(Level.INFO, "Get libre: Source is " + sourceFile + ",and now there are " + numOfST + "/" + libreInstanceCount + "  of libre instance count. And Queue size is act:" + taskQue.size());

    if (numOfST == -1)
    {
      if (taskQue.size() >= getMaxQueueSize())
      {
        addLibre();
        log.log(Level.SEVERE, "STJOB is rejected and the sourcefile is "+sourceFile + ",as LibreTaskQueue(size: " + getMaxQueueSize() +"/"+ taskQue.size()+ " ) is full.");
        ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_OUT_OF_QUEUE_SIZE, false, "", "LibreTaskQueue is full");
        result.addWarning(ce);
        result.setSucceed(false);
        return result;
      }
      taskQue.add(task);
      log.log(Level.INFO, "STJOB was put into queue and the sourcefile is " + sourceFile + ",and now there are " + taskQue.size() + " tasks in queue.");
      synchronized (task)
      {
        try
        {
          task.wait();
        }
        catch (InterruptedException e)
        {
          addLibre();
          ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, false, "", "InterruptedException,job is cancled");
          result.addWarning(ce);
          result.setSucceed(false);
          taskQue.remove(task);
          log.log(Level.SEVERE, "STJOB was canceled and removed from queue and the sourcefile is " + sourceFile + ",as InterruptedException was catched. There are still " + taskQue.size() + " tasks in queue. ");
          return result;
        }
      }
    }
    try
    {
      LibreConverter converter = new LibreConverter();
      result = converter.convert(task.sourceFile, task.targetDir, task.options, this);
    }
    catch (Exception e)
    {
      log.log(Level.SEVERE, "STJOB failed with UnknowError and the sourcefile is "+ sourceFile);
      ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, false, "", "UnknownError.");
      result.addWarning(ce);
      result.setSucceed(false);
      return result;
    }
    finally
    {
//      addLibre();
    }
    return result;
  }
  
  public void notifyNext()
  {
    addLibre();
    log.log(Level.INFO,"STJOB start to notify next. There are still " + taskQue.size() + " tasks in queue. And current free stInstanceCount is " + libreInstanceCount);

    ConversionTask nextTask = taskQue.get();
    if (nextTask != null)
    {
      log.log(Level.INFO,
          "STJOB was taken from queue.the source file is " + nextTask.sourceFile + " ,and there are still " + taskQue.size()
              + " tasks in queue.");
      synchronized (nextTask)
      {
        nextTask.notifyAll();
      }
    }
  }
}
