package com.ibm.concord.platform.util;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spi.util.IStorageLock;

public class StorageNativeLock implements IStorageLock
{
  private static final Logger LOG = Logger.getLogger(StorageNativeLock.class.getName());

  private static ConcurrentMap<Long, Thread> WAITING_THREADS = new ConcurrentHashMap<Long, Thread>();
  private static final int BLOCKED_THREAD_LIMITATION = 20;
  private  FileLocker fileLock;
  private File targetFile;
  
  public StorageNativeLock(File targetFile)
  {
    this.targetFile = targetFile;
  }

  public void lock() throws IOException
  {    
    int count = 0;
    int totalCount = 0;
    Thread currThread = Thread.currentThread();
    fileLock = new FileLocker(targetFile);
    
    if(fileLock.lock())
    {
      return;
    }
    
    while(true)
    {
      try
      {
        Thread.sleep(200);
        count++;
        totalCount++;
        if (fileLock.lock())
        {
          return;
        }
        if (count >= 20)
        {
          int waitingCount = WAITING_THREADS.keySet().size();
          if (WAITING_THREADS.containsKey(currThread.getId()) && totalCount <= 60)
          {
            LOG.log(
                Level.WARNING,
                "Lock Failed, keeping tryLock 20 times again. Count: {0}, Total Count: {1}, Current Thread ID: {2}, Thread Count: {3}",
                new Object[] { count, totalCount, currThread.getId(), waitingCount });
            count = 0;
            continue;
          }

          if (waitingCount < BLOCKED_THREAD_LIMITATION && totalCount <= 60)
          {
            WAITING_THREADS.put(currThread.getId(), currThread);
            LOG.log(Level.WARNING,
                "Lock Failed, keeping tryLock 20 times again. Count: {0}, Total Count: {1}, Current Thread ID: {2}, Thread Count: {3}",
                new Object[] { count, totalCount, currThread.getId(), waitingCount });
            count = 0;
            continue;
          }
          else
          // (wait_count >= block_thread_limit || && total_count > 60)
          {
            WAITING_THREADS.remove(currThread.getId());
            LOG.log(Level.SEVERE, "Lock Failed, tryLock failed due to time out. {0} {1} ", new Object[] {
                targetFile.getPath(), WAITING_THREADS.keySet() });
            throw new IOException("Draft native lock failed.");
          }
        }
        else
        {
          LOG.log(Level.WARNING, "Lock Failed, keeping tryLock. Count: {0}", new Object[] { count });
          continue;
        }
      }
      catch (InterruptedException ie)
      {
        WAITING_THREADS.remove(currThread.getId());
        LOG.log(Level.WARNING, "Lock failed due to InterruptedException. {0} (1) {2}", new Object[] { targetFile.getPath(), ie, WAITING_THREADS.keySet() });
        throw new IOException(ie);
      }
    }        
    
  }
  
  public void release()
  {
    if (fileLock != null)
    {
      fileLock.unlock();
    }
  }

}
