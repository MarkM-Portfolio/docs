/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.mbean;

public interface HouseKeepingMBean
{
  public void reschedule(String frequency);

  public void updateSettings(Integer ageThreshold4Draft, Float sizeThreashold4Draft, Integer ageThreshold4Cache,
      Float sizeThreashold4Cache);

  public String[] showSettings();
}
