/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.lc3.repository;

import java.io.Serializable;

import com.ibm.lconn.core.tkrproxysvc.service.LCRemoteServiceCallContext;
import com.ibm.tk.rproxysvc.service.TKRemoteServiceCallContextProvider;

public class MTServiceCallContextProvider implements TKRemoteServiceCallContextProvider
{
  private String tenantId;
  
  public MTServiceCallContextProvider(String tenantId)
  {
    this.tenantId = tenantId;
  }
  public Serializable getServiceCallContext()
  {
    return new LCRemoteServiceCallContext(tenantId);
  }
}