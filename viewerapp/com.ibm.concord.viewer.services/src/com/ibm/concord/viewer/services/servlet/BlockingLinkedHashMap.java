package com.ibm.concord.viewer.services.servlet;

import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.logging.Level;
import java.util.logging.Logger;

public class BlockingLinkedHashMap<E, V> extends LinkedHashMap<E, V>
{
  /**
   * 
   */
  private static final long serialVersionUID = 5899763210800239574L;

  private final int maxcapacity;

  private final Lock lock = new ReentrantLock();

  private final Condition full = lock.newCondition();

  private final Condition empty = lock.newCondition();

  private static final Logger log = Logger.getLogger(BlockingLinkedHashMap.class.getName());

  public BlockingLinkedHashMap(int capacity)
  {
    super(capacity);
    maxcapacity = capacity;
  }

  public V put(E key, V value)
  {
    lock.lock();

    while (size() == maxcapacity)
    {
      log.log(Level.INFO, "The BLHashMap is full");
      try
      {
        full.await();
        log.log(Level.FINE, "The lock 'full' is activated.");
      }
      catch (InterruptedException e)
      {
        log.log(Level.FINE, e.getMessage());
      }
    }
    V v = super.put(key, value);
    empty.signal();
    lock.unlock();
    return v;
  }

  public E take()
  {
    lock.lock();
    while (size() == 0)
    {
      log.log(Level.INFO, "The BLHashMap is empty");
      try
      {
        empty.await();
        log.log(Level.FINE, "The lock 'empty' is activated.");
      }
      catch (InterruptedException e)
      {
        log.log(Level.INFO, e.getMessage());
      }
    }
    Iterator<E> it = keySet().iterator();
    E key = it.next();
    it.remove();
    full.signal();
    lock.unlock();
    return key;
  }
}