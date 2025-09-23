/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

/**
 * 
 */
package com.ibm.concord.services.mbean;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.platform.Platform;
import com.ibm.concord.spi.exception.AccessException;
import com.ibm.docs.directory.DirectoryComponent;
import com.ibm.docs.directory.IDirectoryAdapter;
import com.ibm.docs.directory.members.IOrg;
import com.ibm.docs.directory.members.Subscriber;
import com.ibm.docs.entitlement.EntitlementComponent;
import com.ibm.docs.entitlement.IEntitlementService;
import com.ibm.docs.entitlement.IEntitlementService.EntitlementLevel;
import com.ibm.docs.entitlement.gatekeeper.GateKeeperAdapter;
import com.ibm.docs.entitlement.gatekeeper.IGateKeeperService;

/**
 * A JMX management bean that being used to manage the entitlements of subscribers on IBM Docs services.
 * 
 */
public class EntitlementsMgr implements EntitlementsMgrMBean
{
  private static final String logName = EntitlementsMgr.class.getName();

  private static final Logger LOG = Logger.getLogger(logName);

  private IEntitlementService service;

  private IGateKeeperService gateKeeperService;

  /**
   * Construct the <code>EntitlementsMgr</code> instance and initialize the member variables.
   * 
   */
  public EntitlementsMgr()
  {
    service = (IEntitlementService) Platform.getComponent(EntitlementComponent.COMPONENT_ID).getService(IEntitlementService.class);
    gateKeeperService = (IGateKeeperService) Platform.getComponent(EntitlementComponent.COMPONENT_ID).getService(IGateKeeperService.class);
  }

  /**
   * Check if the entitlement level is correct or not, if not correct, throw an <code>IllegalArgumentException</code> exception.
   * 
   * @param level
   *          entitlement level being checked
   * @throws IllegalArgumentException
   */
  private void checkEntitlementLevel(String level) throws IllegalArgumentException
  {
    if (!EntitlementLevel.NONE.toString().equalsIgnoreCase(level) && !EntitlementLevel.BASIC.toString().equalsIgnoreCase(level)
        && !EntitlementLevel.SOCIAL.toString().equalsIgnoreCase(level) && !EntitlementLevel.FULL.toString().equalsIgnoreCase(level)
        && !EntitlementLevel.CUSTOM_1.toString().equalsIgnoreCase(level) && !EntitlementLevel.CUSTOM_2.toString().equalsIgnoreCase(level)
        && !EntitlementLevel.CUSTOM_3.toString().equalsIgnoreCase(level))
    {
      throw new IllegalArgumentException("The entitlement level is not correct: " + level);
    }
  }

  /**
   * Check if the subscriber type is correct or not, if not correct, throw an <code>IllegalArgumentException</code> exception. The
   * subscriber type can be: <li><code>SUBSCRIBER_TYPE_USER</code> presents the subscriber is an user.</li> <li>
   * <code>SUBSCRIBER_TYPE_ORG</code> presents the subscriber is an organization.</li> <li><code>SUBSCRIBER_TYPE_GROUP</code> presents the
   * subscriber is a group.</li>
   * 
   * @param type
   *          the type of subscriber being checked
   * @throws IllegalArgumentException
   */
  private void checkSubscriberType(String type) throws IllegalArgumentException
  {
    // TODO: Only one subscriber type SUBSCRIBER_TYPE_ORG is supported currently, Supports others in future.
    if (!SUBSCRIBER_TYPE_ORG.equalsIgnoreCase(type)) // && !SUBSCRIBER_TYPE_USER.equalsIgnoreCase(type) &&
                                                     // !SUBSCRIBER_TYPE_GROUP.equalsIgnoreCase(type))
    {
      throw new IllegalArgumentException("The subscriber type is not correct: " + type);
    }
  }

  /**
   * Convert the string type value to integer type value, the integer types are defines in class <code>Subscriber</code>.
   * 
   * @param typeStr
   *          specifies the string type value
   * @return the integer type value that defines in class <code>Subscriber</code>, -1 if do not find the type
   */
  private int convertType(String typeStr)
  {
    int type = -1;
    if (SUBSCRIBER_TYPE_USER.equalsIgnoreCase(typeStr))
    {
      type = Subscriber.TYPE_USER;
    }
    else if (SUBSCRIBER_TYPE_ORG.equalsIgnoreCase(typeStr))
    {
      type = Subscriber.TYPE_ORG;
    }
    else if (SUBSCRIBER_TYPE_GROUP.equalsIgnoreCase(typeStr))
    {
      type = Subscriber.TYPE_GROUP;
    }
    return type;
  }

  /**
   * Generate a subscriber instance according to the subscriber id, type and entitlement level.
   * 
   * @param subscriberId
   *          specifies the id of subscriber
   * @param type
   *          specifies the type of subscriber
   * @param level
   *          specifies the entitlement level of subscriber
   * @return a <code>Subscriber</code> instance, <code>null</code> if create failed
   */
  private Subscriber createSubscriber(String subscriberId, int type, String level)
  {
    Subscriber subscriber = null;
    IDirectoryAdapter directoryAdapter = (IDirectoryAdapter) Platform.getComponent(DirectoryComponent.COMPONENT_ID).getService(
        IDirectoryAdapter.class);
    if (directoryAdapter != null)
    {
      if (type == Subscriber.TYPE_ORG)
      {
        IOrg org = directoryAdapter.getOrgById(subscriberId);
        if (org != null)
        {
          subscriber = new Subscriber(subscriberId, subscriberId, type, "EN", null, null, Subscriber.STATE_ACTIVE, level);
        }
      }
      else if (type == Subscriber.TYPE_USER)
      {
        // TODO: Support other subscriber type: Subscriber.TYPE_USER
      }
      else if (type == Subscriber.TYPE_GROUP)
      {
        // TODO: Support other subscriber type: Subscriber.TYPE_GROUP
      }
    }
    return subscriber;
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.platform.mbean.EntitlementsMBean#getEntitlementLevel(java.lang.String, java.lang.String)
   */
  public String getEntitlementLevel(String subscriberId, String subscriberType)
  {
    checkSubscriberType(subscriberType);

    String level = null;
    if (service != null)
    {
      Subscriber subcriber = service.getSubscriber(subscriberId, convertType(subscriberType));
      level = subcriber != null ? subcriber.getEntitlement() : level;
    }
    return level;
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.platform.mbean.EntitlementsMBean#addSubscriber(java.lang.String, java.lang.String, java.lang.String)
   */
  public boolean addSubscriber(String subscriberId, String subscriberType, String level)
  {
    checkSubscriberType(subscriberType);
    checkEntitlementLevel(level);

    boolean result = false;
    Subscriber subscriber = createSubscriber(subscriberId, convertType(subscriberType), level);
    if (service != null && subscriber != null)
    {
      result = service.addSubscriber(subscriber);
    }
    return result;
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.platform.mbean.EntitlementsMBean#removeSubscriber(java.lang.String)
   */
  public boolean removeSubscriber(String subscriberId, String subscriberType)
  {
    checkSubscriberType(subscriberType);

    boolean result = false;
    if (service != null)
    {
      result = service.removeSubscriber(subscriberId, convertType(subscriberType));
    }
    return result;
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.platform.mbean.EntitlementsMBean#updateSubscriber(java.lang.String, java.lang.String, java.lang.String)
   */
  public boolean updateSubscriber(String subscriberId, String subscriberType, String level)
  {
    checkSubscriberType(subscriberType);
    checkEntitlementLevel(level);

    boolean result = false;
    if (service != null)
    {
      Subscriber subcriber = service.getSubscriber(subscriberId, convertType(subscriberType));
      if (subcriber != null)
      {
        subcriber.setEntitlement(level);
        result = service.updateSubscriber(subcriber);
      }
    }
    return result;
  }

  /**
   * @see com.ibm.docs.entitlement.gatekeeper.GateKeeperAdapter#doService(String, String)
   */
  public boolean doService(String filepath) throws AccessException
  {
    boolean success = false;
    try
    {
      success = new GateKeeperAdapter().doService(gateKeeperService, filepath);
    }
    catch (AccessException e)
    {
      LOG.log(Level.WARNING, "Failed to execute gatekeeper service: " + e);
      throw e;
    }
    return success;
  }
}
