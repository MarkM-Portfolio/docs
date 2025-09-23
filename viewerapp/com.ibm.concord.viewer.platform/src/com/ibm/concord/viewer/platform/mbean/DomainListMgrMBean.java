/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.mbean;


/**
 * @author linfeng_li
 * 
 */
public interface DomainListMgrMBean
{
  public boolean addDomain(String domain);

  public boolean removeDomain(String domain);

}
