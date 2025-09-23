/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.sym.impl;

import java.util.LinkedList;
import java.util.Queue;

import java.util.logging.Level;
import java.util.logging.Logger;

public class ConversionTaskQueue {
  private static final Logger LOG = Logger.getLogger(ConversionTaskQueue.class.getName());
  private LinkedList taskQue;
  public  int maxConvertTimes;

  public ConversionTaskQueue()
  {
    this.taskQue =  new LinkedList();
    this.maxConvertTimes = 3;
  }

  public void setmaxConvertTimes(int times)
  {
    this.maxConvertTimes = times;
  }

  public synchronized boolean add(ConversionTask task )
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("add: " + task);
    }
    return taskQue.offer(task);
  }

  public synchronized ConversionTask get()
  {
    ConversionTask task = (ConversionTask)taskQue.poll();
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("get: " + task);
    }
    return task;
  }

  public boolean isEmpty()
  {
    return taskQue.isEmpty();
  }
  
  public int size()
  {
    return taskQue.size();
  }
  
  public synchronized boolean remove(ConversionTask task)
  {
    return taskQue.remove(task);
  }
}


