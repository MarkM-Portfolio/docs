/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.sym.util;

import com.sun.star.awt.XCallback;

public class SymphonyCallback implements XCallback
{
  private Job job;

  public SymphonyCallback(Job job)
  {
    this.job = job;
  }

  private java.lang.Exception e = null;

  private Object result = null;

  public void notify(Object arg0)
  {

    try
    {
      result = job.run();
    }
    catch (java.lang.Exception exp)
    {
      this.e = exp;
    }
    
    synchronized (job)
    {
      job.notifyAll();
    }

  }

  public java.lang.Exception getException()
  {
    return e;
  }

  public Object getResult()
  {
    return result;
  }
}