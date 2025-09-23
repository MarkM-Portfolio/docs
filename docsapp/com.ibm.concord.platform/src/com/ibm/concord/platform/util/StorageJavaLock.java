package com.ibm.concord.platform.util;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.nio.channels.OverlappingFileLockException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spi.util.IStorageLock;

public class StorageJavaLock implements IStorageLock
{
  
  private static final Logger LOG = Logger.getLogger(StorageJavaLock.class.getName());

  private static ConcurrentMap<Long, Thread> WAITING_THREADS = new ConcurrentHashMap<Long, Thread>();

  private static final int BLOCKED_THREAD_LIMITATION = 20;

  protected File draftFile;

  private FileChannel lockFileChannel;

  private FileLock draftLck;
  
  public StorageJavaLock(File targetFile)
  {
    draftFile = targetFile;
  }
  
  public void lock() throws IOException
  {
    FileOutputStream fos = new FileOutputStream(draftFile);
    lockFileChannel = fos.getChannel();

    try
    {
      draftLck = lockFileChannel.lock();
    }
    catch (IOException e)
    {
      if (e.getMessage() != null && e.getMessage().equals("Resource deadlock avoided"))
      {
        LOG.log(Level.WARNING, "Lock Failed due to IOException: Resource deadlock avoided, keeping tryLock. {0}", draftFile.getPath());
        tryLock();
      }
      else
      {
        throw e;
      }
    }
    catch (OverlappingFileLockException e)
    {
      LOG.log(Level.WARNING, "Lock Failed due to OverlappingFileLockException, keeping tryLock. {0}", draftFile.getPath());
      tryLock();
    }
  }

  private void tryLock() throws IOException
  {
    int count = 0;
    int totalCount = 0;
    Thread currThread = Thread.currentThread();
    while (true)
    {
      try
      {
        Thread.sleep(500);
        count++;
        totalCount++;
        draftLck = lockFileChannel.tryLock();
        if (draftLck == null)
        {
          LOG.log(Level.WARNING, "Lock Failed due to lock held by other process, keeping wait. {0}", draftFile.getPath());
          lock();

          if (draftLck != null)
          {
            break;
          }
        }
        else
        {
          LOG.log(Level.WARNING, "Lock Failed due to OverlappingFileLockException, tryLock success. {0}", draftFile.getPath());
          break;
        }
      }
      catch (InterruptedException ie)
      {
        WAITING_THREADS.remove(currThread.getId());
        LOG.log(Level.WARNING, "Lock Failed due to OverlappingFileLockException, tryLock failed due to InterruptedException. {0} (1) {2}",
            new Object[] { draftFile.getPath(), ie, WAITING_THREADS.keySet() });
        throw new IOException(ie);
      }
      catch (Exception e)
      {
        if ((e instanceof OverlappingFileLockException)
            || ((e instanceof IOException) && (e.getMessage() != null && e.getMessage().equals("Resource deadlock avoided"))))
        {
          if (count >= 20)
          {
            int waitingCount = WAITING_THREADS.keySet().size();
            if (WAITING_THREADS.containsKey(currThread.getId()) && totalCount <= 60)
            {
              LOG.log(
                  Level.WARNING,
                  "Lock Failed due to {0}, keeping tryLock 20 times again. Count: {1}, Total Count: {2}, Current Thread ID: {3}, Thread Count: {4}",
                  new Object[] { e.getClass().getName(), count, totalCount, currThread.getId(), waitingCount });
              count = 0;
              continue;
            }

            if (waitingCount < BLOCKED_THREAD_LIMITATION && totalCount <= 60)
            {
              WAITING_THREADS.put(currThread.getId(), currThread);
              LOG.log(Level.WARNING,
                  "Lock Failed due to {0}, keeping tryLock. Count: {1}, Total Count: {2}, Current Thread ID: {3}, Thread Count: {4}",
                  new Object[] { e.getClass().getName(), count, totalCount, currThread.getId(), waitingCount });
              count = 0;
              continue;
            }
            else
            // (wait_count >= block_thread_limit || && total_count > 60)
            {
              WAITING_THREADS.remove(currThread.getId());
              LOG.log(Level.SEVERE, "Lock Failed due to {0}, tryLock failed due to time out. {1} {2} {3}", new Object[] {
                  e.getClass().getName(), draftFile.getPath(), e, WAITING_THREADS.keySet() });
              throw new IOException(e);
            }
          }
          else
          {
            LOG.log(Level.WARNING, "Lock Failed due to {0}, keeping tryLock. Count: {1}", new Object[] { e.getClass().getName(), count });
            continue;
          }
        }
        else
        {
          throw new IOException(e);
        }
      }
    }
    WAITING_THREADS.remove(currThread.getId());
    LOG.log(Level.WARNING, "Number of Locked Thread: {0}", WAITING_THREADS.keySet().size());
  }

  public void release() throws IOException
  {
    if (draftLck != null)
    {
      draftLck.release();
      draftLck = null;
    }

    if (lockFileChannel != null)
    {
      lockFileChannel.close();
      lockFileChannel = null;
    }
  }
  
}
