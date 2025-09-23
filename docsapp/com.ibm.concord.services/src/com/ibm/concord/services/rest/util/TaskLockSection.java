/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.util;

import java.util.concurrent.ConcurrentHashMap;

import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.TaskAction;
import com.ibm.concord.spi.beans.TaskBean;
import com.ibm.concord.spi.exception.AccessException;
import com.ibm.docs.directory.beans.UserBean;

public abstract class TaskLockSection
{

  private static ConcurrentHashMap<String, LockCounter> lockMap = new ConcurrentHashMap<String, LockCounter>();

  public TaskBean execute(UserBean user, IDocumentEntry docEntry, String taskId, TaskAction action) throws AccessException
  {
    if (taskId == null)
      return null;

    TaskBean task = null;
    Object lock = this.getLock(taskId);
    try
    {
      synchronized (lock)
      {
        task = this.perform(user, docEntry, action);
      }
      return task;
    }
    catch (AccessException e)
    {
      throw e;
    }
    finally
    {
      this.releaseLock(taskId);
    }

  }

  public abstract TaskBean perform(UserBean user, IDocumentEntry docEntry, TaskAction action) throws AccessException;

  private Object getLock(String lockKey)
  {
    LockCounter counter = lockMap.get(lockKey);
    if (counter == null)
    {
      lockMap.putIfAbsent(lockKey, new LockCounter());
      counter = lockMap.get(lockKey);
    }

    synchronized (counter)
    {
      counter = lockMap.get(lockKey);
      if (counter == null)
      {
        // Another thread has removed the lock
        lockMap.put(lockKey, new LockCounter());
        counter = lockMap.get(lockKey);
      }
      counter.increaseCounter();
      lockMap.put(lockKey, counter);
    }

    return counter;
  }

  private void releaseLock(String lockKey)
  {
    if (lockKey == null)
      return;

    LockCounter counter = lockMap.get(lockKey);
    if (counter != null)
    {
      synchronized (counter)
      {
        counter = lockMap.get(lockKey);
        counter.decreaseCounter();
        if (counter.getCounter() == 0)
        {
          lockMap.remove(lockKey);
        }
        else
        {
          lockMap.put(lockKey, counter);
        }
      }
    }
  }
}

class LockCounter
{
  private int counter;

  public void increaseCounter()
  {
    counter++;
  }

  public void decreaseCounter()
  {
    counter--;
  }

  public int getCounter()
  {
    return counter;
  }
}
