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

import java.util.concurrent.ConcurrentLinkedQueue;

public class ConversionTaskQueue
{
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
