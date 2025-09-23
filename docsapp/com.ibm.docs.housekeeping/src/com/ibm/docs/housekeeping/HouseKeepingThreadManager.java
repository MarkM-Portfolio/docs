/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2018. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.housekeeping;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.docs.housekeeping.bean.HouseKeepingData;
import com.ibm.docs.housekeeping.bean.HouseKeepingResult;
import com.ibm.docs.housekeeping.bean.HouseKeepingType;
import com.ibm.docs.housekeeping.service.IHouseKeepingService;
import com.ibm.docs.housekeeping.service.JobCacheService;
import com.ibm.docs.housekeeping.service.MigrationService;
import com.ibm.docs.housekeeping.service.SnapshotService;
import com.ibm.docs.housekeeping.service.UploadService;
import com.ibm.docs.housekeeping.util.HouseKeepingUtil;

public class HouseKeepingThreadManager
{

  private static final Logger log = Logger.getLogger(HouseKeepingThreadManager.class.getName());

  // singleton instance
  private static HouseKeepingThreadManager instance = new HouseKeepingThreadManager();

  // thread pool
  private ThreadPoolExecutor threadPool;

  // orgId, task(Future) map
  private Map<String, Future<HouseKeepingResult>> taskMap;

  // the number of threads to keep in the pool, even if they are idle.
  private int corePoolSize = 2;

  // the maximum number of threads to allow in the pool
  private int maximumPoolSize = 16;

  /**
   * when the number of threads is greater than the core, this is the maximum time that excess idle threads will wait for new tasks before
   * terminating. Time unit is milliseconds.
   */
  private int keepAliveTime = 6000;

  // the maximum number of job queue
  private int queueCapacity = 32;

  public static HouseKeepingThreadManager getInstance()
  {
    return instance;
  }

  private HouseKeepingThreadManager()
  {
    init();
  }

  @SuppressWarnings({ "unchecked", "rawtypes" })
  private void init()
  {
    int numCPUs = Runtime.getRuntime().availableProcessors();
    // On smart cloud environment, corePoolSize is 3, totally there are 4 processors.
    corePoolSize = numCPUs > 2 ? (Math.round(numCPUs / 2) + 1) : numCPUs;
    threadPool = new ThreadPoolExecutor(corePoolSize, maximumPoolSize, keepAliveTime, TimeUnit.MILLISECONDS, new ArrayBlockingQueue(
        queueCapacity), new ThreadPoolExecutor.DiscardPolicy());
    taskMap = new ConcurrentHashMap<String, Future<HouseKeepingResult>>();
  }

  public long getThreadPoolCoreSize()
  {
    return corePoolSize;
  }

  public ThreadPoolExecutor getThreadPool()
  {
    return threadPool;
  }

  public int getActiveCount()
  {
    return threadPool.getActiveCount();
  }

  public String submitTask(List<HouseKeepingData> hkData, HouseKeepingType type) throws ConcordException, RejectedExecutionException
  {
    IHouseKeepingService service = null;
    switch (type)
      {
        case MIGRATION :
          service = new MigrationService(hkData);
          break;
        case SNAPSHOT :
          service = new SnapshotService(hkData);
          break;
        case UPLOAD :
          service = new UploadService(hkData);
          break;
        case CACHE :
          service = new JobCacheService(hkData);
          break;
        default:
          break;
      }
    Future<HouseKeepingResult> future = threadPool.submit(service);
    taskMap.put(service.getServiceId(), future);
    return service.getServiceId();
  }

  public String submitTask(IHouseKeepingService service) throws ConcordException, RejectedExecutionException
  {
    Future<HouseKeepingResult> future = threadPool.submit(service);
    taskMap.put(service.getServiceId(), future);
    return service.getServiceId();
  }

  /**
   * Are all scheduled task complete
   * 
   * @return whether all tasks are complete
   */
  public boolean isAllCompleted()
  {
    log.entering(getClass().getName(), "isAllCompleted");
    Iterator<String> itk = taskMap.keySet().iterator();
    while (itk.hasNext())
    {
      String key = itk.next();
      if (!isCompleted(key))
      {
        return false;
      }
    }
    log.exiting(getClass().getName(), "isAllCompleted", true);
    return true;
  }

  private boolean isCompleted(String serviceId)
  {
    log.entering(getClass().getName(), "isCompleted", serviceId);

    Future<HouseKeepingResult> task = taskMap.get(serviceId);
    if (task != null)
    {
      log.exiting(getClass().getName(), "isCompleted", task.isDone());
      return task.isDone();
    }
    log.exiting(getClass().getName(), "isCompleted", false);
    return false;
  }

  /**
   * Get the number of all cleaned Caches for a given organization
   * 
   * @return the cleaned number
   */
  public long getCleanedCaches()
  {
    log.entering(getClass().getName(), "getCleanedCaches");
    Iterator<String> itk = taskMap.keySet().iterator();
    long count = 0;
    while (itk.hasNext())
    {
      String key = itk.next();
      if (!HouseKeepingUtil.isServiceId(key, HouseKeepingUtil.CACHE))
      {
        continue;
      }
      HouseKeepingResult result = this.getResult(key);
      if (result != null)
        count += result.getCleanedCaches();

    }
    log.exiting(getClass().getName(), "getCleanedCaches", true);
    return count;
  }

  /**
   * Get the number of all cleaned snapshot drafts
   * 
   * @return the cleaned number
   */
  public long getCleanedSnapshots()
  {
    log.entering(getClass().getName(), "getCleanedSnapshots");
    long count = 0;
    Iterator<String> itk = taskMap.keySet().iterator();
    while (itk.hasNext())
    {
      String key = itk.next();
      if (!HouseKeepingUtil.isServiceId(key, HouseKeepingUtil.SNAPSHOT))
      {
        continue;
      }
      HouseKeepingResult result = this.getResult(key);
      if (result != null)
        count += result.getCleanedSnapshots();
    }
    log.exiting(getClass().getName(), "getCleanedSnapshots", true);
    return count;
  }

  /**
   * Get the number of all cleaned upload drafts
   * 
   * @return the cleaned number
   */
  public long getCleanedUploadDrafts()
  {
    log.entering(getClass().getName(), "getCleanedUploadDrafts");
    long count = 0;
    Iterator<String> itk = taskMap.keySet().iterator();
    while (itk.hasNext())
    {
      String key = itk.next();
      if (!HouseKeepingUtil.isServiceId(key, HouseKeepingUtil.UPLOAD))
      {
        continue;
      }
      HouseKeepingResult result = this.getResult(key);
      if (result != null)
        count += result.getCleanedUploads();
    }
    log.exiting(getClass().getName(), "getCleanedUploadDrafts", true);
    return count;
  }

  /**
   * Get the number of all cleaned migrations drafts
   * 
   * @return the cleaned number
   */
  public long[] getCleanedMigrations()
  {
    log.entering(getClass().getName(), "getCleanedMigrations");
    long[] count = { 0, 0 };
    Iterator<String> itk = taskMap.keySet().iterator();
    while (itk.hasNext())
    {
      String key = itk.next();
      if (!HouseKeepingUtil.isServiceId(key, HouseKeepingUtil.MIGRATION))
      {
        continue;
      }
      HouseKeepingResult result = this.getResult(key);
      if (result != null)
      {
        count[0] += result.getMigratedCount();
        count[1] += result.getFailedMigrations();
      }
    }
    log.exiting(getClass().getName(), "getCleanedMigrations", true);
    return count;
  }

  public HouseKeepingResult getResult(String serviceId)
  {
    log.entering(getClass().getName(), "getResult", serviceId);
    if (isCompleted(serviceId))
    {
      Future<HouseKeepingResult> task = taskMap.get(serviceId);
      if (task != null && task.isDone())
        try
        {
          HouseKeepingResult result = task.get();
          // remove the entry, so that a result can be fetched only one time
          taskMap.remove(serviceId);
          log.exiting(getClass().getName(), "getResult", result);
          return result;
        }
        catch (InterruptedException e)
        {
          log.severe(e.getMessage());
        }
        catch (ExecutionException e)
        {
          log.severe(e.getMessage());
        }
    }
    log.exiting(getClass().getName(), "getScanResult");
    return null;
  }

  public void cancelHouseKeepingMainTask() throws ConcordException
  {
    log.entering(getClass().getName(), "cancelHouseKeepingMainTask");
    Iterator<String> itk = taskMap.keySet().iterator();
    while (itk.hasNext())
    {
      String key = itk.next();
      if (HouseKeepingUtil.isServiceId(key, HouseKeepingUtil.MAIN))
      {
        this.cancelTask(key);
        return;
      }
    }
    log.exiting(getClass().getName(), "cancelHouseKeepingMainTask", true);
  }

  public void cancelAllTasks() throws ConcordException
  {
    log.entering(getClass().getName(), "cancelAllTask");
    Iterator<String> itk = taskMap.keySet().iterator();
    while (itk.hasNext())
    {
      String key = itk.next();
      this.cancelTask(key);
    }
    log.exiting(getClass().getName(), "cancelAllTask", true);
  }

  public void cancelTask(String serviceId) throws ConcordException
  {
    log.entering(getClass().getName(), "cancelTask");
    Future<HouseKeepingResult> task = taskMap.get(serviceId);
    if (task != null)
    {
      task.cancel(true);
      taskMap.remove(serviceId);
      log.log(Level.INFO, "canceled the HK job: " + serviceId);
    }
    log.exiting(getClass().getName(), "cancelTask", "void");
  }
}
