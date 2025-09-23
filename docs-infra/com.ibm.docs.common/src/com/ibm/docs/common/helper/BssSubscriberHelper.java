/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2017. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.common.helper;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.bss.shim.BssFactory;
import com.ibm.bss.shim.SettingProviderRemoteBss;
import com.ibm.bss.shim.SubscriberService;
import com.ibm.bss.shim.dto.EntityId;
import com.ibm.bss.shim.dto.member.Subscriber;
import com.ibm.bss.shim.exceptions.BssCallException;

public class BssSubscriberHelper
{
  private static Logger log = Logger.getLogger(BssSubscriberHelper.class.getName());

  private static BssFactory bssFactory = null;

  private static SubscriberService getSubscriberService(String hostName)
  {
    log.entering(BssSubscriberHelper.class.getName(), "getSubscriberService");

    SubscriberService subscriber = getBssFacotry(hostName).subscriber();

    log.exiting(BssSubscriberHelper.class.getName(), "getSubscriberService", subscriber);

    return subscriber;
  }

  public static BssFactory getBssFacotry(String hostName)
  {
    log.entering(BssSubscriberHelper.class.getName(), "getBssFacotry");

    if (bssFactory == null)
    {
      if (hostName == null || hostName.isEmpty())
      {
        log.log(Level.SEVERE, "Failed to get BSS hostname from viewer-config.json.");
        log.exiting(BssSubscriberHelper.class.getName(), "getBssFacotry", bssFactory);
        return null;
      }
      else
      {
        SettingProviderRemoteBss sp = new SettingProviderRemoteBss(hostName);
        BssFactory.setDefaultSettingProvider(sp);
        bssFactory = BssFactory.instance();
      }
    }
    log.exiting(BssSubscriberHelper.class.getName(), "getBssFacotry", bssFactory);

    return bssFactory;
  }

  public static Subscriber fetchSubscriber(String hostName, EntityId subscriberId) throws BssCallException
  {
    log.entering(BssSubscriberHelper.class.getName(), "fetchSubscriber", subscriberId);

    Subscriber subscriber = null;
    subscriber = getSubscriberService(hostName).getSubscriber(subscriberId, null);

    log.exiting(BssSubscriberHelper.class.getName(), "fetchSubscriber", subscriber);

    return subscriber;
  }

}
