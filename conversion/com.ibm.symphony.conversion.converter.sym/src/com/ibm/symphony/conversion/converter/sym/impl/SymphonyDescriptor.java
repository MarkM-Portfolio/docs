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

public class SymphonyDescriptor
{
  public String host;

  public String port;

  public int retry;

  public SymphonyDescriptor(String host, String port)
  {
    this.host = host;
    this.port = port;
    this.retry = 0;
  }

  public boolean equal(SymphonyDescriptor obj)
  {
    if(obj != null && obj instanceof SymphonyDescriptor)
    {
      return obj.host.equals(host) && obj.port.equals(port);  
    }
    return false;
  }

  public void increaseRefuseConnectTimes()
  {
    retry++;
  }
}
