/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.admin.mbean;

public interface HouseKeepingMBean
{
  public void reschedule(String frequency);

  public void updateSettings(Integer latestVersionAgeThreshold4Cache, Float cacheSizeThreshold4Cache);

}
