package com.ibm.symphony.conversion.converter.conversionlib;

import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.logging.Logger;

public class ConversionTaskQueue
{
  private static final Logger log = Logger.getLogger(ConversionTaskQueue.class.getName());

  ConcurrentLinkedQueue<ConversionTask> queue;

  public ConversionTaskQueue()
  {
    this.queue = new ConcurrentLinkedQueue<ConversionTask>();
  }

  public boolean add(ConversionTask task)
  {
    return queue.offer(task);
  }

  public ConversionTask get()
  {
    return queue.poll();
  }

  public boolean isEmpty()
  {
    return queue.isEmpty();
  }

  public int size()
  {
    return queue.size();
  }
  public boolean remove(ConversionTask task)
  {
    return queue.remove(task);
  }


}
