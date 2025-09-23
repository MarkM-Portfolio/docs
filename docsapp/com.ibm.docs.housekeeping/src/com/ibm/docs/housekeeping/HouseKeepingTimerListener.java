/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2018. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.housekeeping;

import commonj.timers.Timer;
import commonj.timers.TimerListener;

public class HouseKeepingTimerListener implements TimerListener
{
  public void timerExpired(Timer arg0)
  {
    HouseKeepingMonitor.getInstance().process();
  }

}
